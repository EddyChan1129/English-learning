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

export function getSpellingHint(answer: string): string {
  const normalized = answer.trim().replace(/\s+/g, " ");
  const letters = [...normalized].filter((character) => /[a-z]/i.test(character));
  if (!letters.length) return "";
  if (letters.length === 1) return letters[0].toLowerCase();
  return `${letters[0].toLowerCase()}${"_".repeat(Math.max(normalized.length - 2, 1))}${letters.at(-1)?.toLowerCase()}`;
}

export function shuffled<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
