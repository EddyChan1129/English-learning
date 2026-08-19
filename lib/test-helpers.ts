import type { TestMode, WordDocument } from "@/types";

export const testModes: TestMode[] = ["pronunciation", "synonym", "gap-fill"];

export function normalizeAnswer(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/[.,!?;:'\"“”‘’]/g, "");
}

export function isWordAnswerCorrect(answer: string, word: string): boolean {
  return normalizeAnswer(answer) === normalizeAnswer(word);
}

export function isSynonymAnswerCorrect(answer: string, synonyms: string[]): boolean {
  const normalized = normalizeAnswer(answer);
  return synonyms.some((synonym) => normalizeAnswer(synonym) === normalized);
}

export function makeGapSentence(sentence: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return sentence.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "_____");
}

export function availableModes(word: WordDocument): TestMode[] {
  return testModes.filter((mode) => mode !== "synonym" || word.synonyms.length > 0);
}

export function randomMode(word: WordDocument): TestMode {
  const modes = availableModes(word);
  return modes[Math.floor(Math.random() * modes.length)];
}
