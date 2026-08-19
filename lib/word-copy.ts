import type { WordDocument } from "@/types";

export function makeCopiedWord(source: WordDocument, friendUid: string, today: string, createdAt: string) {
  return {
    word: source.word,
    chineseMeaning: source.chineseMeaning,
    synonyms: source.synonyms,
    sentences: source.sentences,
    partsOfSpeech: source.partsOfSpeech,
    commonPhrases: source.commonPhrases,
    stage: 0 as const,
    status: "learning" as const,
    nextTestDate: today,
    createdAt,
    copiedFrom: { userId: friendUid, wordId: source.id },
  };
}
