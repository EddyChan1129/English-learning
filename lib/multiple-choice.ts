import type { WordDocument } from "../types/index.ts";
import { normalizeAnswer, shuffled } from "./test-helpers.ts";

type ChoiceWord = Pick<WordDocument, "id" | "word" | "chineseMeaning" | "chineseMeanings" | "synonyms" | "partsOfSpeech" | "status">;

function meanings(word: ChoiceWord) {
  return (word.chineseMeanings.length ? word.chineseMeanings : [word.chineseMeaning])
    .flatMap((meaning) => meaning.split(/[；;，,、/]/))
    .map((meaning) => meaning.replace(/\s/g, "").trim()).filter(Boolean);
}

export function makeMultipleChoice(current: ChoiceWord, words: readonly ChoiceWord[]) {
  const target = normalizeAnswer(current.word);
  const targetMeanings = meanings(current);
  if (!target || !targetMeanings.length) return null;
  const synonyms = new Set(current.synonyms.map(normalizeAnswer));
  const seen = new Set([target]);
  const candidates = shuffled([...words]).filter((word) => {
    const term = normalizeAnswer(word.word);
    if (word.id === current.id || word.status === "inactive" || !term || seen.has(term)
      || synonyms.has(term) || word.synonyms.some((synonym) => normalizeAnswer(synonym) === target)) return false;
    const candidateMeanings = meanings(word);
    if (!candidateMeanings.length || candidateMeanings.some((meaning) => targetMeanings.some((other) => meaning.includes(other) || other.includes(meaning)))) return false;
    seen.add(term);
    return true;
  });
  // Prefer the same part of speech, then similar spelling; randomize ties.
  const score = (word: ChoiceWord) =>
    (word.partsOfSpeech.some((part) => current.partsOfSpeech.includes(part)) ? 100 : 0)
    + (normalizeAnswer(word.word)[0] === target[0] ? 10 : 0)
    - Math.abs(word.word.length - current.word.length);
  candidates.sort((a, b) => score(b) - score(a));
  if (candidates.length < 3) return null;
  return shuffled([current, ...candidates.slice(0, 3)]).map(({ id, word }) => ({ id, word }));
}
