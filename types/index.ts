export type Stage = 0 | 1 | 2 | 3;
export type WordStatus = "learning" | "mastered" | "inactive";
export const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
  "determiner",
  "auxiliaryVerb",
  "phrasalVerb",
] as const;
export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];

export interface WordDocument {
  id: string;
  word: string;
  chineseMeaning: string;
  synonyms: string[];
  sentences: string[];
  sentenceExplanations: string[];
  partsOfSpeech: PartOfSpeech[];
  commonPhrases: string[];
  stage: Stage;
  status: WordStatus;
  nextTestDate: string;
  createdAt: string;
  lastTestedAt?: string;
  copiedFrom?: {
    userId: string;
    wordId: string;
  };
}

export type NewWord = Pick<
  WordDocument,
  "word" | "chineseMeaning" | "synonyms" | "sentences" | "sentenceExplanations" | "partsOfSpeech" | "commonPhrases"
>;

export interface UserTarget {
  targetWords: number;
  targetDays: number;
  startDate: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  friendCode: string;
  createdAt: string;
}

export interface FriendDocument {
  uid: string;
  displayName: string;
  addedAt: string;
}
