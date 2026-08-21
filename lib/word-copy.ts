import type { WordDocument } from "@/types";

export function makeCopiedWord(source: WordDocument, friendUid: string, nextTestAt: string, createdAt: string) {
  return {
    word: source.word,
    chineseMeaning: source.chineseMeaning,
    synonyms: source.synonyms,
    sentences: source.sentences,
    partsOfSpeech: source.partsOfSpeech,
    commonPhrases: source.commonPhrases,
    stage: 0 as const,
    status: "learning" as const,
    nextTestDate: nextTestAt,
    createdAt,
    copiedFrom: { userId: friendUid, wordId: source.id },
  };
}
