export type Stage = 0 | 1 | 2 | 3;
export type WordStatus = "learning" | "mastered" | "inactive";

export interface WordDocument {
  id: string;
  word: string;
  chineseMeaning: string;
  synonyms: string[];
  sentences: string[];
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
  "word" | "chineseMeaning" | "synonyms" | "sentences"
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

export type TestMode = "pronunciation" | "synonym" | "gap-fill";
