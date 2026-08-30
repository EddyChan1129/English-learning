import type { WordDocument } from "../types/index.ts";

export function normalizeAnswer(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/[.,!?;:'\"“”‘’]/g, "");
}

export function isWordAnswerCorrect(answer: string, word: string): boolean {
  return normalizeAnswer(answer) === normalizeAnswer(word);
}

export type GapQuestion = {
  sentence: string;
  answer: string;
};

const INFLECTION_SUFFIXES = ["s", "es", "d", "ed", "ing"];
const IRREGULAR_FORMS: Record<string, string[]> = {
  blow: ["blew", "blown"],
  break: ["broke", "broken"],
  bring: ["brought"],
  build: ["built"],
  catch: ["caught"],
  come: ["came"],
  do: ["did", "done"],
  eat: ["ate", "eaten"],
  fall: ["fell", "fallen"],
  feel: ["felt"],
  get: ["got", "gotten"],
  give: ["gave", "given"],
  go: ["went", "gone"],
  hold: ["held"],
  keep: ["kept"],
  lead: ["led"],
  leave: ["left"],
  make: ["made"],
  pay: ["paid"],
  ring: ["rang", "rung"],
  run: ["ran"],
  see: ["saw", "seen"],
  sell: ["sold"],
  shake: ["shook", "shaken"],
  sit: ["sat"],
  stand: ["stood"],
  take: ["took", "taken"],
  tear: ["tore", "torn"],
  tell: ["told"],
  think: ["thought"],
  throw: ["threw", "thrown"],
  wake: ["woke", "woken"],
};

function isInflectedForm(candidate: string, root: string): boolean {
  const value = candidate.toLocaleLowerCase("en-US");
  const base = root.toLocaleLowerCase("en-US");
  if (value === base) return true;
  if (IRREGULAR_FORMS[base]?.includes(value)) return true;
  if (INFLECTION_SUFFIXES.some((suffix) => value === `${base}${suffix}`)) return true;
  if (base.endsWith("e") && value === `${base.slice(0, -1)}ing`) return true;
  if (base.endsWith("y") && value === `${base.slice(0, -1)}ies`) return true;
  if (base.endsWith("y") && value === `${base.slice(0, -1)}ied`) return true;
  const finalLetter = base.at(-1);
  return Boolean(finalLetter && ["ed", "ing"].some((suffix) => value === `${base}${finalLetter}${suffix}`));
}

export function getVerbEndingHint(answer: string, root: string): "s" | "ed" | null {
  const answerVerb = normalizeAnswer(answer).split(" ")[0];
  const rootVerbs = normalizeAnswer(root).split(" ")[0].split("/");
  if (!answerVerb || rootVerbs.includes(answerVerb)) return null;
  if (!rootVerbs.some((rootVerb) => isInflectedForm(answerVerb, rootVerb))) return null;
  if (answerVerb.endsWith("ed")) return "ed";
  return answerVerb.endsWith("s") ? "s" : null;
}

export function makeGapQuestion(sentence: string, word: string): GapQuestion {
  const target = word.trim().replace(/\s+/g, " ");
  if (!target) return { sentence, answer: "" };

  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const exactMatch = new RegExp(`\\b${escaped}\\b`, "i").exec(sentence);
  if (exactMatch) {
    return {
      sentence: `${sentence.slice(0, exactMatch.index)}_____${sentence.slice(exactMatch.index + exactMatch[0].length)}`,
      answer: exactMatch[0],
    };
  }

  if (/^[a-z]+$/i.test(target)) {
    const candidates = [...sentence.matchAll(/[a-z]+(?:['’-][a-z]+)*/gi)];
    const inflectedMatch = candidates.find((match) => isInflectedForm(match[0], target));
    if (inflectedMatch?.index !== undefined) {
      return {
        sentence: `${sentence.slice(0, inflectedMatch.index)}_____${sentence.slice(inflectedMatch.index + inflectedMatch[0].length)}`,
        answer: inflectedMatch[0],
      };
    }
  }

  const targetParts = target.split(" ").map((part) => part.toLocaleLowerCase("en-US").split("/"));
  const sentenceWords = [...sentence.matchAll(/[a-z]+(?:['’-][a-z]+)*/gi)];
  if (targetParts.length > 1) {
    for (let start = 0; start <= sentenceWords.length - targetParts.length; start += 1) {
      const window = sentenceWords.slice(start, start + targetParts.length);
      const matches = window.every((match, index) => index === 0
        ? targetParts[index].some((part) => isInflectedForm(match[0], part))
        : targetParts[index].includes(match[0].toLocaleLowerCase("en-US")));
      const firstIndex = window[0].index;
      const lastMatch = window.at(-1);
      if (matches && firstIndex !== undefined && lastMatch?.index !== undefined) {
        const end = lastMatch.index + lastMatch[0].length;
        return {
          sentence: `${sentence.slice(0, firstIndex)}_____${sentence.slice(end)}`,
          answer: sentence.slice(firstIndex, end),
        };
      }
    }
  }

  return { sentence, answer: target };
}

export function makeGapSentence(sentence: string, word: string): string {
  return makeGapQuestion(sentence, word).sentence;
}

export function makeWordTestQuestion(word: Pick<WordDocument, "word" | "sentences" | "sentenceExplanations">) {
  const matchingIndex = word.sentences.findIndex((sentence) => makeGapQuestion(sentence, word.word).sentence !== sentence);
  const sentenceIndex = matchingIndex >= 0 ? matchingIndex : 0;
  const sourceSentence = word.sentences[sentenceIndex] ?? "";
  return {
    ...makeGapQuestion(sourceSentence, word.word),
    sourceSentence,
    translation: word.sentenceExplanations[sentenceIndex] ?? "",
  };
}

export function getSpellingHint(answer: string): string {
  const normalized = answer.trim().replace(/\s+/g, " ");
  const letters = [...normalized].filter((character) => /[a-z]/i.test(character));
  if (!letters.length) return "";
  if (letters.length === 1) return letters[0].toLowerCase();
  return `${letters[0].toLowerCase()}${"_".repeat(Math.max(normalized.length - 2, 1))}${letters.at(-1)?.toLowerCase()}`;
}

export type SpellingHintCharacter = {
  character: string;
  state: "shown" | "correct" | "incorrect" | "pending" | "separator";
};

export function getSpellingHintCharacters(answer: string, typedAnswer: string): SpellingHintCharacter[] {
  const normalized = answer.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
  const typed = typedAnswer.toLocaleLowerCase("en-US");
  const alphabeticIndexes = [...normalized]
    .map((character, index) => /[a-z]/i.test(character) ? index : -1)
    .filter((index) => index >= 0);
  const first = alphabeticIndexes[0];
  const last = alphabeticIndexes.at(-1);

  return [...normalized].map((character, index) => {
    if (!/[a-z]/i.test(character)) {
      return { character, state: "separator" };
    }
    if (index === first || index === last) {
      return { character, state: "shown" };
    }
    if (typed.length <= index) {
      return { character: "_", state: "pending" };
    }
    return {
      character: "_",
      state: typed[index] === character ? "correct" : "incorrect",
    };
  });
}

export function shuffled<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
