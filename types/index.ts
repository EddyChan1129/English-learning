export type Stage = 0 | 1 | 2 | 3;

export interface WordDocument {
  id: string;
  word: string;
  chineseMeaning: string;
  synonyms: string[];
  sentences: string[];
  stage: Stage;
  status: "learning" | "mastered";
  nextTestDate: string;
  createdAt: string;
  lastTestedAt?: string;
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

export type TestMode = "pronunciation" | "synonym" | "gap-fill";
