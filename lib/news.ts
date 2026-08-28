import type { NewsDocument, NewsUploadInput } from "@/types";

const NEWS_DAY_ID_PATTERN = /^days-(20\d{2}-\d{2}-\d{2})$/;
const MAX_PARAGRAPHS = 200;
const MAX_ARTICLE_CHARACTERS = 200_000;

export function makeNewsDocument(dayId: string, input: unknown, publishedAt: string): NewsDocument {
  const date = newsDateFromDayId(dayId);
  if (!Number.isFinite(Date.parse(publishedAt))) throw new Error("publishedAt must be a valid timestamp.");

  return {
    id: dayId,
    date,
    ...validateNewsUploadInput(input),
    publishedAt,
    published: true,
  };
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
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("News file must contain a JSON object.");
  }

  const data = input as Record<string, unknown>;
  const title = requiredString(data, "title", 180);
  const summary = requiredString(data, "summary", 600);
  const sourceName = requiredString(data, "sourceName", 120);
  const sourceUrl = requiredString(data, "sourceUrl", 2_000);
  if (!Array.isArray(data.paragraphs) || data.paragraphs.some((paragraph) => typeof paragraph !== "string")) {
    throw new Error("paragraphs must be an array of plain-text strings.");
  }
  if (data.paragraphs.length > MAX_PARAGRAPHS) {
    throw new Error(`paragraphs cannot contain more than ${MAX_PARAGRAPHS} items.`);
  }

  const paragraphs = data.paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean);
  if (!paragraphs.length) throw new Error("paragraphs must contain at least one non-empty paragraph.");
  if (paragraphs.join("").length > MAX_ARTICLE_CHARACTERS) {
    throw new Error("News article is too long for one Firestore document.");
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

  return { title, summary, paragraphs, sourceName, sourceUrl };
}

function requiredString(data: Record<string, unknown>, key: string, maxLength: number) {
  const value = data[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`);
  const cleanValue = value.trim();
  if (cleanValue.length > maxLength) throw new Error(`${key} cannot exceed ${maxLength} characters.`);
  return cleanValue;
}
