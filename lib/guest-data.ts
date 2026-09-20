import { PARTS_OF_SPEECH, type WordDocument, type UserTarget, type LanguagePreferences, type SentenceAttemptDocument, type NewWord } from "../types/index.ts";
import { DEFAULT_LANGUAGE_PREFERENCES, normalizeLanguagePreferences } from "./languages.ts";
import { normalizeVocabularyKey, DUPLICATE_VOCABULARY_ERROR } from "./vocabulary.ts";
import { makeGapQuestion } from "./test-helpers.ts";
import { parseSentenceEvaluation } from "./sentence-evaluation.ts";

export type GuestData = {
  version: 1;
  words: WordDocument[];
  target: UserTarget | null;
  categories: string[];
  preferences: LanguagePreferences;
  attempts: SentenceAttemptDocument[];
};

export function emptyGuestData(): GuestData {
  return { version: 1, words: [], target: null, categories: [], preferences: { ...DEFAULT_LANGUAGE_PREFERENCES }, attempts: [] };
}

export function makeGuestWord(input: NewWord, words: WordDocument[], id: string, now: string): WordDocument {
  validateGuestWord(input, words);
  return { ...input, id, stage: 0, status: "learning", createdAt: now, nextTestDate: now };
}

export function validateGuestWord(input: NewWord, words: WordDocument[], excludedId?: string) {
  const key = normalizeVocabularyKey(input.word);
  if (!key || input.sentences.length < 2 || !input.chineseMeanings.length || !input.partsOfSpeech.length) throw new Error("invalid-word");
  if (!input.sentences.some((sentence) => makeGapQuestion(sentence, input.word).sentence !== sentence)) throw new Error("invalid-examples");
  if (words.some((word) => word.id !== excludedId && normalizeVocabularyKey(word.word) === key)) throw new Error(DUPLICATE_VOCABULARY_ERROR);
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid-backup");
  return value as Record<string, unknown>;
}
function string(value: unknown, max = 2000): string {
  if (typeof value !== "string" || value.length > max) throw new Error("invalid-backup");
  return value;
}
function list(value: unknown, max = 10000): unknown[] {
  if (!Array.isArray(value) || value.length > max) throw new Error("invalid-backup");
  return value;
}
function strings(value: unknown, max = 100): string[] { return list(value, max).map((item) => string(item)); }
function date(value: unknown): string {
  const result = string(value, 50);
  if (!Number.isFinite(Date.parse(result))) throw new Error("invalid-backup");
  return result;
}
function positive(value: unknown): number {
  if (!Number.isInteger(value) || Number(value) <= 0 || Number(value) > 1000000) throw new Error("invalid-backup");
  return Number(value);
}

// Rebuild imported records from allowed fields; never trust backup JSON as app state.
export function parseGuestBackup(value: unknown): GuestData {
  const data = object(value);
  if (data.version !== 1) throw new Error("unsupported-backup-version");
  const ids = new Set<string>();
  const terms = new Set<string>();
  const words = list(data.words).map((value): WordDocument => {
    const item = object(value);
    const id = string(item.id, 100);
    const word = string(item.word, 100).trim();
    const key = normalizeVocabularyKey(word);
    if (!id || /\//.test(id) || !word || ids.has(id) || terms.has(key)) throw new Error("invalid-backup");
    ids.add(id); terms.add(key);
    if (![0, 1, 2, 3].includes(Number(item.stage)) || typeof item.stage !== "number"
      || !["learning", "mastered", "inactive"].includes(String(item.status))) throw new Error("invalid-backup");
    const parts = strings(item.partsOfSpeech, 30);
    if (parts.some((part) => !PARTS_OF_SPEECH.includes(part as typeof PARTS_OF_SPEECH[number]))) throw new Error("invalid-backup");
    const result: WordDocument = {
      id, word, chineseMeaning: string(item.chineseMeaning), chineseMeanings: strings(item.chineseMeanings),
      synonyms: strings(item.synonyms), sentences: strings(item.sentences), sentenceExplanations: strings(item.sentenceExplanations),
      partsOfSpeech: parts as WordDocument["partsOfSpeech"], commonPhrases: strings(item.commonPhrases), categories: strings(item.categories ?? []),
      stage: item.stage as WordDocument["stage"], status: item.status as WordDocument["status"],
      nextTestDate: date(item.nextTestDate), createdAt: date(item.createdAt),
    };
    if (item.lastTestedAt !== undefined) result.lastTestedAt = date(item.lastTestedAt);
    if (item.lastTestUsedHint !== undefined) {
      if (typeof item.lastTestUsedHint !== "boolean") throw new Error("invalid-backup");
      result.lastTestUsedHint = item.lastTestUsedHint;
    }
    if (item.sourcePlan) {
      const source = object(item.sourcePlan);
      result.sourcePlan = { planId: string(source.planId, 100), entryId: string(source.entryId, 100) };
    }
    return result;
  });
  let target: UserTarget | null = null;
  if (data.target !== null) {
    const item = object(data.target);
    target = { targetWords: positive(item.targetWords), targetDays: positive(item.targetDays), startDate: date(item.startDate) };
    if (item.startingMastered !== undefined) {
      if (!Number.isInteger(item.startingMastered) || Number(item.startingMastered) < 0) throw new Error("invalid-backup");
      target.startingMastered = Number(item.startingMastered);
    }
  }
  const attemptIds = new Set<string>();
  const attempts = list(data.attempts).map((value): SentenceAttemptDocument => {
    const item = object(value);
    const result = parseSentenceEvaluation(item, string(item.model, 200));
    const id = string(item.id, 100);
    const wordId = string(item.wordId, 100);
    if (!result || !id || id.includes("/") || attemptIds.has(id) || !ids.has(wordId)) throw new Error("invalid-backup");
    attemptIds.add(id);
    return { ...result, id, wordId, targetWord: string(item.targetWord, 100), sentence: string(item.sentence, 500), createdAt: date(item.createdAt) };
  });
  return { version: 1, words, target, categories: strings(data.categories, 1000), preferences: normalizeLanguagePreferences(data.preferences), attempts };
}

// Merge backups without replacing existing vocabulary or its progress.
export function mergeGuestData(current: GuestData, incoming: GuestData): GuestData {
  const words = [...current.words];
  const keys = new Map(words.map((word) => [normalizeVocabularyKey(word.word), word.id]));
  const ids = new Set(words.map((word) => word.id));
  const remapped = new Map<string, string>();
  for (const word of incoming.words) {
    const key = normalizeVocabularyKey(word.word);
    let id = keys.get(key);
    if (!id) {
      id = word.id;
      let suffix = 1;
      while (ids.has(id)) id = `${word.id.slice(0, 80)}-import-${suffix++}`;
      words.push({ ...word, id }); ids.add(id); keys.set(key, id);
    }
    remapped.set(word.id, id);
  }
  const attempts = [...current.attempts];
  const attemptIds = new Set(attempts.map((attempt) => attempt.id));
  for (const attempt of incoming.attempts) {
    if (!attemptIds.has(attempt.id)) {
      attempts.push({ ...attempt, wordId: remapped.get(attempt.wordId)! });
      attemptIds.add(attempt.id);
    }
  }
  return { ...current, words, attempts, target: current.target ?? incoming.target,
    categories: [...new Set([...current.categories, ...incoming.categories])],
    preferences: current.words.length || current.target ? current.preferences : incoming.preferences };
}
