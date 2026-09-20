import type { WordDocument } from "../types/index.ts";

export type SentenceWordOrder = "az" | "za" | "unpractised" | "scoreLow" | "scoreHigh" | "testSoonest" | "testLatest";

type ScoredWord = { id: string; word: string; nextTestDate: string; status: WordDocument["status"] };

export function isSentencePracticeEligible(word: Pick<WordDocument, "stage" | "status">) {
  return word.status !== "inactive";
}

export function sortSentenceWords<T extends ScoredWord>(
  words: T[],
  scores: Map<string, number>,
  order: SentenceWordOrder,
) {
  return [...words].sort((a, b) => {
    const alphabetical = a.word.localeCompare(b.word, "en");
    if (order === "az") return alphabetical;
    if (order === "za") return -alphabetical;
    if (order === "testSoonest" || order === "testLatest") {
      const statusComparison = Number(a.status !== "learning") - Number(b.status !== "learning");
      if (statusComparison) return statusComparison;
      const dateComparison = Date.parse(a.nextTestDate) - Date.parse(b.nextTestDate);
      return (order === "testSoonest" ? dateComparison : -dateComparison) || alphabetical;
    }

    const aScore = scores.get(a.id);
    const bScore = scores.get(b.id);
    if (order === "unpractised") {
      if (aScore === undefined && bScore !== undefined) return -1;
      if (aScore !== undefined && bScore === undefined) return 1;
      return alphabetical;
    }
    if (aScore === undefined && bScore !== undefined) return 1;
    if (aScore !== undefined && bScore === undefined) return -1;
    if (aScore === undefined || bScore === undefined) return alphabetical;
    return (order === "scoreLow" ? aScore - bScore : bScore - aScore) || alphabetical;
  });
}
