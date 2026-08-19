import { addDays } from "./date.ts";
import type { WordDocument } from "@/types";

export function makeCopiedWord(source: WordDocument, friendUid: string, today: string, createdAt: string) {
  return {
    word: source.word,
    chineseMeaning: source.chineseMeaning,
    synonyms: source.synonyms,
    sentences: source.sentences,
    stage: 1 as const,
    status: "learning" as const,
    nextTestDate: addDays(today, 2),
    createdAt,
    copiedFrom: { userId: friendUid, wordId: source.id },
  };
}
