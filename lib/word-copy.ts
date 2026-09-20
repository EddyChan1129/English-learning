import type { WordDocument } from "@/types";

export function makeCopiedWord(source: WordDocument, friendUid: string, nextTestAt: string, createdAt: string) {
  return {
    word: source.word,
    chineseMeaning: source.chineseMeanings?.[0] ?? source.chineseMeaning,
    chineseMeanings: source.chineseMeanings?.length ? source.chineseMeanings : [source.chineseMeaning],
    synonyms: source.synonyms,
    sentences: source.sentences,
    sentenceExplanations: source.sentenceExplanations ?? [],
    partsOfSpeech: source.partsOfSpeech,
    commonPhrases: source.commonPhrases,
    categories: [],
    stage: 0 as const,
    status: "learning" as const,
    nextTestDate: nextTestAt,
    createdAt,
    copiedFrom: { userId: friendUid, wordId: source.id },
  };
}
