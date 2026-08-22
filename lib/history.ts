import { localDateKey } from "./date.ts";
import { PARTS_OF_SPEECH, type PartOfSpeech } from "../types/index.ts";

export type HistoryWordOrder = "az" | "za" | "part";

export function countNewWordsByLocalDate(words: Array<{ createdAt?: string }>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) {
    const date = localDateKey(word.createdAt);
    if (date) counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  return counts;
}

export function compareHistoryWords(
  a: { word: string; partsOfSpeech: PartOfSpeech[] },
  b: { word: string; partsOfSpeech: PartOfSpeech[] },
  order: HistoryWordOrder,
) {
  if (order === "part") {
    const partComparison = primaryPartIndex(a.partsOfSpeech) - primaryPartIndex(b.partsOfSpeech);
    if (partComparison) return partComparison;
  }
  const alphabetical = a.word.localeCompare(b.word, "en", { sensitivity: "base" });
  return order === "za" ? -alphabetical : alphabetical;
}

function primaryPartIndex(parts: PartOfSpeech[]) {
  return parts.length ? Math.min(...parts.map((part) => PARTS_OF_SPEECH.indexOf(part))) : PARTS_OF_SPEECH.length;
}
