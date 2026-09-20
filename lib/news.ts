import type { NewsArticle, NewsDocument, NewsParagraph, NewsUploadInput } from "@/types";

const NEWS_DAY_ID_PATTERN = /^days-(20\d{2}-\d{2}-\d{2})(?:-\d{2})?$/;
const MAX_ARTICLES = 20;
const MAX_PARAGRAPHS = 200;
const MAX_ARTICLE_CHARACTERS = 200_000;

export function makeNewsDocument(dayId: string, input: unknown, publishedAt: string): NewsDocument {
  const date = newsDateFromDayId(dayId);
  if (!Number.isFinite(Date.parse(publishedAt))) throw new Error("publishedAt must be a valid timestamp.");

  return {
    id: dayId,
    date,
    articles: validateNewsUploadInput(input),
    publishedAt,
    published: true,
  };
}

export function normalizeStoredNewsDocument(dayId: string, input: unknown): NewsDocument | null {
  try {
    if (!input || typeof input !== "object" || Array.isArray(input)) return null;
    const data = input as Record<string, unknown>;
    if (data.published !== true) return null;
    const articles = validateNewsUploadInput(Array.isArray(data.articles) ? data.articles : data);
    return {
      id: dayId,
      date: newsDateFromDayId(dayId),
      articles,
      publishedAt: typeof data.publishedAt === "string" ? data.publishedAt : "",
      published: true,
    };
  } catch {
    return null;
  }
}

export function newsDateFromDayId(dayId: string) {
  const date = NEWS_DAY_ID_PATTERN.exec(dayId)?.[1];
  const timestamp = date ? Date.parse(`${date}T00:00:00Z`) : Number.NaN;
  if (!date || !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
    throw new Error("News filename must use a real date in the format days-YYYY-MM-DD.json.");
  }
  return date;
}

export function normalizeNewsSelection(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[“”"'([{]+|[“”"'\])},.!?;:…]+$/g, "");
}

export function sentenceAtOffset(text: string, offset: number) {
  const safeOffset = Math.max(0, Math.min(offset, text.length));
  const sentenceEnd = /[.!?。！？]/;
  let start = 0;
  let end = text.length;

  for (let index = safeOffset - 1; index >= 0; index -= 1) {
    if (sentenceEnd.test(text[index])) {
      start = index + 1;
      break;
    }
  }
  for (let index = safeOffset; index < text.length; index += 1) {
    if (sentenceEnd.test(text[index])) {
      end = index + 1;
      break;
    }
  }
  return text.slice(start, end).trim();
}

export function validateNewsUploadInput(input: unknown): NewsUploadInput {
  if (Array.isArray(input)) {
    if (!input.length) throw new Error("News file must contain at least one article.");
    if (input.length > MAX_ARTICLES) throw new Error(`News file cannot contain more than ${MAX_ARTICLES} articles.`);
    return input.map((article, index) => validateNewsArticle(article, `articles[${index}]`, true));
  }
  return [validateNewsArticle(input, "article", false)];
}

function validateNewsArticle(input: unknown, label: string, bilingual: boolean): NewsArticle {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error(`${label} must be a JSON object.`);
  }

  const data = input as Record<string, unknown>;
  const title = requiredString(data, "title", 180, label);
  const summary = requiredString(data, "summary", 600, label);
  const chineseMeaning = bilingual ? requiredString(data, "chineseMeaning", 600, label) : optionalString(data, "chineseMeaning", 600, label);
  const sourceName = requiredString(data, "sourceName", 120, label);
  const sourceUrl = requiredString(data, "sourceUrl", 2_000, label);
  if (!Array.isArray(data.paragraphs)) throw new Error(`${label}.paragraphs must be an array.`);
  if (data.paragraphs.length > MAX_PARAGRAPHS) {
    throw new Error(`${label}.paragraphs cannot contain more than ${MAX_PARAGRAPHS} items.`);
  }

  const paragraphs = data.paragraphs
    .map((paragraph, index) => validateNewsParagraph(paragraph, `${label}.paragraphs[${index}]`, bilingual))
    .filter((paragraph) => paragraph.english);
  if (!paragraphs.length) throw new Error(`${label}.paragraphs must contain at least one non-empty paragraph.`);
  if (paragraphs.reduce((length, paragraph) => length + paragraph.english.length + paragraph.chinese.length, 0) > MAX_ARTICLE_CHARACTERS) {
    throw new Error(`${label} is too long for one Firestore document.`);
  }

  let parsedSourceUrl: URL;
  try {
    parsedSourceUrl = new URL(sourceUrl);
  } catch {
    throw new Error("sourceUrl must be a valid URL.");
  }
  if (parsedSourceUrl.protocol !== "https:" && parsedSourceUrl.protocol !== "http:") {
    throw new Error("sourceUrl must use http or https.");
  }

  return { title, summary, chineseMeaning, paragraphs, sourceName, sourceUrl };
}

function validateNewsParagraph(input: unknown, label: string, bilingual: boolean): NewsParagraph {
  if (typeof input === "string" && !bilingual) return { english: input.trim(), chinese: "" };
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error(`${label} must contain English and Chinese text.`);
  }
  const data = input as Record<string, unknown>;
  return {
    english: requiredString(data, "english", MAX_ARTICLE_CHARACTERS, label),
    chinese: bilingual
      ? requiredString(data, "chinese", MAX_ARTICLE_CHARACTERS, label)
      : optionalString(data, "chinese", MAX_ARTICLE_CHARACTERS, label),
  };
}

function requiredString(data: Record<string, unknown>, key: string, maxLength: number, label?: string) {
  const value = data[key];
  const field = label ? `${label}.${key}` : key;
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required.`);
  const cleanValue = value.trim();
  if (cleanValue.length > maxLength) throw new Error(`${field} cannot exceed ${maxLength} characters.`);
  return cleanValue;
}

function optionalString(data: Record<string, unknown>, key: string, maxLength: number, label: string) {
  const value = data[key];
  if (value === undefined) return "";
  if (typeof value !== "string") throw new Error(`${label}.${key} must be a string.`);
  const cleanValue = value.trim();
  if (cleanValue.length > maxLength) throw new Error(`${label}.${key} cannot exceed ${maxLength} characters.`);
  return cleanValue;
}
