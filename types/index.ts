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
  "adjectivePhrase",
  "adverbialPhrase",
  "collocation",
  "conjunctionPhrase",
  "discoursePhrase",
  "fixedPhrase",
  "infinitivePhrase",
  "linkingPhrase",
  "prepositionalPhrase",
  "pronounPhrase",
  "quantifierPhrase",
  "verbPhrase",
] as const;
export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];

export const PART_OF_SPEECH_ABBREVIATIONS: Record<PartOfSpeech, string> = {
  noun: "N",
  verb: "V",
  adjective: "ADJ",
  adverb: "ADV",
  pronoun: "PRON",
  preposition: "PREP",
  conjunction: "CONJ",
  interjection: "INTJ",
  determiner: "DET",
  auxiliaryVerb: "AUX",
  phrasalVerb: "PHR.V",
  adjectivePhrase: "ADJ.P",
  adverbialPhrase: "ADV.P",
  collocation: "COLL",
  conjunctionPhrase: "CONJ.P",
  discoursePhrase: "DISC.P",
  fixedPhrase: "FIX.P",
  infinitivePhrase: "INF.P",
  linkingPhrase: "LINK.P",
  prepositionalPhrase: "PREP.P",
  pronounPhrase: "PRON.P",
  quantifierPhrase: "QUANT.P",
  verbPhrase: "V.P",
};

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
  categories?: string[];
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
  "word" | "chineseMeaning" | "chineseMeanings" | "synonyms" | "sentences" | "sentenceExplanations" | "partsOfSpeech" | "commonPhrases" | "categories"
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

export interface NewsDocument {
  id: string;
  date: string;
  title: string;
  summary: string;
  paragraphs: string[];
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  published: boolean;
}

export type NewsUploadInput = Pick<
  NewsDocument,
  "title" | "summary" | "paragraphs" | "sourceName" | "sourceUrl"
>;

export interface UserTarget {
  targetWords: number;
  targetDays: number;
  startDate: string;
}

export type SupportedLanguageCode = "en-US" | "zh-HK" | "zh-CN" | "fr-FR" | "es-ES" | "de-DE" | "ja-JP" | "ko-KR";

export interface LanguagePreferences {
  learningLanguage: SupportedLanguageCode;
  explanationLanguage: SupportedLanguageCode;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  normalizedUsername: string;
  friendCode: string;
  createdAt: string;
}

export interface FriendDocument {
  uid: string;
  displayName: string;
  addedAt: string;
}

export interface FriendRequestDocument {
  senderUid: string;
  senderDisplayName: string;
  recipientUid: string;
  createdAt: string;
}
