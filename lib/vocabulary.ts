export const DUPLICATE_VOCABULARY_ERROR = "word-already-added";

export function normalizeVocabularyKey(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

export function isDuplicateVocabularyError(error: unknown): boolean {
  return error instanceof Error && error.message === DUPLICATE_VOCABULARY_ERROR;
}
