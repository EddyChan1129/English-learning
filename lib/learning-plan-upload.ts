import { makeGapQuestion } from "./test-helpers.ts";
import { PARTS_OF_SPEECH, type LearningPlan, type LearningPlanEntry, type PartOfSpeech } from "../types/index.ts";

const PLAN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ENTRIES = 2_000;
const PART_OF_SPEECH_ALIASES: Record<string, PartOfSpeech> = {
  "adjective phrase": "adjectivePhrase",
  "adverbial phrase": "adverbialPhrase",
  "conjunction phrase": "conjunctionPhrase",
  "discourse phrase": "discoursePhrase",
  "fixed phrase": "fixedPhrase",
  "infinitive phrase": "infinitivePhrase",
  "linking phrase": "linkingPhrase",
  "phrasal verb": "phrasalVerb",
  "prepositional phrase": "prepositionalPhrase",
  "pronoun phrase": "pronounPhrase",
  "quantifier phrase": "quantifierPhrase",
  "verb phrase": "verbPhrase",
};

export function makeLearningPlanUpload(input: unknown): {
  plan: LearningPlan;
  entries: LearningPlanEntry[];
} {
  const data = objectValue(input, "Learning plan file");
  const id = requiredString(data.id, "id", 100);
  const slug = requiredString(data.slug, "slug", 100);
  if (!PLAN_ID_PATTERN.test(id) || !PLAN_ID_PATTERN.test(slug)) {
    throw new Error("id and slug must use lowercase words separated by hyphens.");
  }
  if (!Array.isArray(data.entries) || !data.entries.length || data.entries.length > MAX_ENTRIES) {
    throw new Error(`entries must contain between 1 and ${MAX_ENTRIES} items.`);
  }

  const seenTerms = new Set<string>();
  const entries = data.entries.map((value, index) => {
    const entry = objectValue(value, `entries[${index}]`);
    const term = requiredString(entry.term, `entries[${index}].term`, 100);
    const normalizedTerm = term.toLocaleLowerCase().replace(/\s+/g, " ");
    if (seenTerms.has(normalizedTerm)) throw new Error(`Duplicate term: ${term}.`);
    seenTerms.add(normalizedTerm);

    const englishDefinition = requiredString(entry.englishDefinition, `entries[${index}].englishDefinition`, 500);
    const chineseMeanings = stringArray(entry.chineseMeanings, `entries[${index}].chineseMeanings`, 1, 5);
    const synonyms = stringArray(entry.synonyms, `entries[${index}].synonyms`, 0, 10);
    const partsOfSpeech = partOfSpeechArray(entry.partsOfSpeech, `entries[${index}].partsOfSpeech`);
    if (!Array.isArray(entry.examples) || entry.examples.length < 2 || entry.examples.length > 100) {
      throw new Error(`entries[${index}].examples must contain between 2 and 100 bilingual examples.`);
    }
    const examples = entry.examples.map((example, exampleIndex) => {
      const pair = objectValue(example, `entries[${index}].examples[${exampleIndex}]`);
      const label = `entries[${index}].examples[${exampleIndex}]`;
      const hasSense = pair.sense !== undefined || pair.meaning !== undefined || pair.pattern !== undefined;
      return {
        ...(hasSense ? {
          sense: requiredString(pair.sense, `${label}.sense`, 100),
          meaning: requiredString(pair.meaning, `${label}.meaning`, 200),
          pattern: requiredString(pair.pattern, `${label}.pattern`, 200),
        } : {}),
        english: requiredString(pair.english, `entries[${index}].examples[${exampleIndex}].english`, 500),
        chinese: requiredString(pair.chinese, `entries[${index}].examples[${exampleIndex}].chinese`, 500),
      };
    });

    const senses = new Map<string, typeof examples>();
    for (const example of examples) {
      if (example.sense) senses.set(example.sense, [...(senses.get(example.sense) ?? []), example]);
    }
    if (senses.size && examples.some((example) => !example.sense)) {
      throw new Error(`entries[${index}]: every example must have sense metadata when any example has it.`);
    }
    for (const [sense, pairs] of senses) {
      if (new Set(pairs.map((pair) => pair.english.trim().toLowerCase())).size < 2) {
        throw new Error(`entries[${index}].sense ${sense} needs at least two distinct examples.`);
      }
      if (pairs.some((pair) => pair.meaning !== pairs[0].meaning || pair.pattern !== pairs[0].pattern)) {
        throw new Error(`entries[${index}].sense ${sense} has inconsistent meaning or pattern.`);
      }
    }

    if (!examples.some(({ english }) => makeGapQuestion(english, term).sentence !== english)) {
      throw new Error(`entries[${index}] “${term}”: examples do not match the target phrase. At least one matching example is required.`);
    }

    return {
      id: String(index + 1),
      order: index + 1,
      term,
      englishDefinition,
      chineseMeanings,
      synonyms,
      examples,
      partsOfSpeech,
      searchTokens: makeSearchTokens([term, englishDefinition, ...chineseMeanings, ...synonyms]),
    };
  });

  return {
    plan: {
      id,
      slug,
      title: localizedText(data.title, "title", 120),
      description: localizedText(data.description, "description", 500),
      level: localizedText(data.level, "level", 80),
      entryCount: entries.length,
      order: positiveInteger(data.order, "order"),
      featured: booleanValue(data.featured, "featured"),
      published: true,
    },
    entries,
  };
}

function objectValue(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function localizedText(value: unknown, label: string, maxLength: number) {
  const data = objectValue(value, label);
  return {
    en: requiredString(data.en, `${label}.en`, maxLength),
    zh: requiredString(data.zh, `${label}.zh`, maxLength),
  };
}

function requiredString(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required.`);
  const cleanValue = value.trim();
  if (cleanValue.length > maxLength) throw new Error(`${label} cannot exceed ${maxLength} characters.`);
  return cleanValue;
}

function stringArray(value: unknown, label: string, minimum: number, maximum: number) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    throw new Error(`${label} must contain between ${minimum} and ${maximum} items.`);
  }
  return value.map((item, index) => requiredString(item, `${label}[${index}]`, 200));
}

function partOfSpeechArray(value: unknown, label: string): PartOfSpeech[] {
  if (!Array.isArray(value) || !value.length) throw new Error(`${label} must contain at least one item.`);
  return value.map((part) => {
    const normalizedPart = typeof part === "string" ? PART_OF_SPEECH_ALIASES[part] ?? part : part;
    if (typeof normalizedPart !== "string" || !PARTS_OF_SPEECH.includes(normalizedPart as PartOfSpeech)) {
      throw new Error(`${label} contains an unsupported part of speech.`);
    }
    return normalizedPart as PartOfSpeech;
  });
}

function positiveInteger(value: unknown, label: string) {
  if (!Number.isInteger(value) || Number(value) < 1) throw new Error(`${label} must be a positive integer.`);
  return Number(value);
}

function booleanValue(value: unknown, label: string) {
  if (typeof value !== "boolean") throw new Error(`${label} must be true or false.`);
  return value;
}

function makeSearchTokens(values: string[]) {
  const tokens = new Set<string>();
  for (const value of values) {
    const normalized = value.trim().toLocaleLowerCase();
    if (!normalized) continue;
    tokens.add(normalized);
    for (const word of normalized.split(/[\s、，,/]+/)) {
      if (word) tokens.add(word);
    }
  }
  return [...tokens];
}
