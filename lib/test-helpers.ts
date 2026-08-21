export function normalizeAnswer(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/[.,!?;:'\"“”‘’]/g, "");
}

export function isWordAnswerCorrect(answer: string, word: string): boolean {
  return normalizeAnswer(answer) === normalizeAnswer(word);
}

export function makeGapSentence(sentence: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return sentence.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "_____");
}
