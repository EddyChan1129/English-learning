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
  chineseMeanings: string[];
  synonyms: string[];
  sentences: string[];
  sentenceExplanations: string[];
  partsOfSpeech: PartOfSpeech[];
  commonPhrases: string[];
  stage: Stage;
  status: WordStatus;
  nextTestDate: string;
  createdAt: string;
  normalizedWord?: string;
  normalizedWordKey?: string;
  lastTestedAt?: string;
  lastTestUsedHint?: boolean;
  copiedFrom?: {
    userId: string;
    wordId: string;
  };
  sourcePlan?: {
    planId: string;
    entryId: string;
  };
}

export type NewWord = Pick<
  WordDocument,
  "word" | "chineseMeaning" | "chineseMeanings" | "synonyms" | "sentences" | "sentenceExplanations" | "partsOfSpeech" | "commonPhrases"
> & Pick<WordDocument, "sourcePlan">;

export interface LearningExample {
  english: string;
  chinese: string;
}

export interface LearningPlan {
  id: string;
  slug: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  level: { en: string; zh: string };
  entryCount: number;
  order: number;
  featured: boolean;
  published: boolean;
}

export interface LearningPlanEntry {
  id: string;
  order: number;
  term: string;
  englishDefinition: string;
  chineseMeanings: string[];
  synonyms: string[];
  examples: LearningExample[];
  partsOfSpeech: PartOfSpeech[];
  searchTokens: string[];
}

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
