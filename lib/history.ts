import { localDateKey } from "./date.ts";
import { PARTS_OF_SPEECH, type PartOfSpeech } from "../types/index.ts";

export type HistoryWordOrder = "az" | "za" | "part" | "newest" | "oldest" | "testSoonest" | "testLatest";
export const DEFAULT_HISTORY_WORD_ORDER: HistoryWordOrder = "testSoonest";

export function countNewWordsByLocalDate(words: Array<{ createdAt?: string }>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) {
    const date = localDateKey(word.createdAt);
    if (date) counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  return counts;
}

export function compareHistoryWords(
  a: { word: string; partsOfSpeech: PartOfSpeech[]; createdAt?: string; nextTestDate?: string; status?: string },
  b: { word: string; partsOfSpeech: PartOfSpeech[]; createdAt?: string; nextTestDate?: string; status?: string },
  order: HistoryWordOrder,
) {
  if (order === "part") {
    const partComparison = primaryPartIndex(a.partsOfSpeech) - primaryPartIndex(b.partsOfSpeech);
    if (partComparison) return partComparison;
  }
  if (order === "newest" || order === "oldest") {
    const dateComparison = compareTimestamps(a.createdAt, b.createdAt, order === "newest" ? "desc" : "asc");
    if (dateComparison) return dateComparison;
  }
  if (order === "testSoonest" || order === "testLatest") {
    const statusComparison = Number(a.status !== "learning") - Number(b.status !== "learning");
    if (statusComparison) return statusComparison;
    const dateComparison = compareTimestamps(a.nextTestDate, b.nextTestDate, order === "testSoonest" ? "asc" : "desc");
    if (dateComparison) return dateComparison;
  }
  const alphabetical = a.word.localeCompare(b.word, "en", { sensitivity: "base" });
  return order === "za" ? -alphabetical : alphabetical;
}

function compareTimestamps(a: string | undefined, b: string | undefined, direction: "asc" | "desc") {
  const aTime = a ? Date.parse(a) : Number.NaN;
  const bTime = b ? Date.parse(b) : Number.NaN;
  const validityComparison = Number(!Number.isFinite(aTime)) - Number(!Number.isFinite(bTime));
  if (validityComparison) return validityComparison;
  return direction === "asc" ? aTime - bTime : bTime - aTime;
}

function primaryPartIndex(parts: PartOfSpeech[]) {
  return parts.length ? Math.min(...parts.map((part) => PARTS_OF_SPEECH.indexOf(part))) : PARTS_OF_SPEECH.length;
}
