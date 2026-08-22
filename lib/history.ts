import { localDateKey } from "./date.ts";

export function countNewWordsByLocalDate(words: Array<{ createdAt?: string }>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) {
    const date = localDateKey(word.createdAt);
    if (date) counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  return counts;
}
