import type { WordDocument } from "../types/index.ts";

export function normalizeAnswer(value: string): string {
  return value.replace(/\.{3,}|…/g, " ").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US").replace(/[.,!?;:'\"“”‘’]/g, "");
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
  be: ["am", "is", "are", "was", "were", "been"],
  become: ["became", "become"],
  blow: ["blew", "blown"],
  break: ["broke", "broken"],
  bring: ["brought"],
  build: ["built"],
  buy: ["bought"],
  catch: ["caught"],
  choose: ["chose", "chosen"],
  come: ["came"],
  do: ["did", "done"],
  eat: ["ate", "eaten"],
  fall: ["fell", "fallen"],
  feel: ["felt"],
  find: ["found"],
  forget: ["forgot", "forgotten"],
  get: ["got", "gotten"],
  give: ["gave", "given"],
  go: ["went", "gone"],
  grow: ["grew", "grown"],
  have: ["has", "had"],
  hold: ["held"],
  keep: ["kept"],
  know: ["knew", "known"],
  lead: ["led"],
  leave: ["left"],
  lend: ["lent"],
  lose: ["lost"],
  make: ["made"],
  mean: ["meant"],
  meet: ["met"],
  pay: ["paid"],
  ring: ["rang", "rung"],
  run: ["ran"],
  say: ["said"],
  see: ["saw", "seen"],
  sell: ["sold"],
  send: ["sent"],
  shake: ["shook", "shaken"],
  sit: ["sat"],
  spend: ["spent"],
  stand: ["stood"],
  take: ["took", "taken"],
  tear: ["tore", "torn"],
  tell: ["told"],
  think: ["thought"],
  throw: ["threw", "thrown"],
  understand: ["understood"],
  wake: ["woke", "woken"],
  wear: ["wore", "worn"],
  win: ["won"],
  write: ["wrote", "written"],
};

function isRegularInflectedForm(candidate: string, root: string): boolean {
  const value = candidate.toLocaleLowerCase("en-US");
  const base = root.toLocaleLowerCase("en-US");
  if (value === base) return true;
  if (INFLECTION_SUFFIXES.some((suffix) => value === `${base}${suffix}`)) return true;
  if (base.endsWith("e") && value === `${base.slice(0, -1)}ing`) return true;
  if (base.endsWith("y") && value === `${base.slice(0, -1)}ies`) return true;
  if (base.endsWith("y") && value === `${base.slice(0, -1)}ied`) return true;
  const finalLetter = base.at(-1);
  return Boolean(finalLetter && ["ed", "ing"].some((suffix) => value === `${base}${finalLetter}${suffix}`));
}

function isInflectedForm(candidate: string, root: string): boolean {
  const value = candidate.toLocaleLowerCase("en-US");
  const base = root.toLocaleLowerCase("en-US");
  return Boolean(IRREGULAR_FORMS[base]?.includes(value)) || isRegularInflectedForm(value, base);
}

export function getVerbEndingHint(answer: string, root: string): "s" | "ed" | null {
  const answerVerb = normalizeAnswer(answer).split(" ")[0];
  const rootVerbs = normalizeAnswer(root).split(" ")[0].split("/");
  if (!answerVerb || rootVerbs.includes(answerVerb)) return null;
  if (!rootVerbs.some((rootVerb) => isRegularInflectedForm(answerVerb, rootVerb))) return null;
  if (answerVerb.endsWith("ed")) return "ed";
  return answerVerb.endsWith("s") ? "s" : null;
}

export function getMissingVerbEnding(answer: string, correctAnswer: string): "s" | "ed" | null {
  const answerParts = normalizeAnswer(answer).split(/\s+/).filter(Boolean);
  const correctParts = normalizeAnswer(correctAnswer).split(/\s+/).filter(Boolean);
  if (!answerParts.length || answerParts.length !== correctParts.length) return null;
  if (answerParts.slice(1).some((part, index) => part !== correctParts[index + 1])) return null;
  return getVerbEndingHint(correctParts[0], answerParts[0]);
}

export function makeGapQuestion(sentence: string, word: string): GapQuestion {
  const target = word.trim().replace(/\s+/g, " ");
  if (!target) return { sentence, answer: "" };

  if (/\.{3,}|…/.test(target)) {
    const segments = target.split(/\.{3,}|…/).map((segment) => segment.trim());
    // An explicit slot must sit between fixed parts of the phrase.
    if (segments.some((segment) => !segment)) return { sentence, answer: target };
    const roots = segments[0].split(" ")[0].toLowerCase().split("/");
    const patterns = segments.map((segment, segmentIndex) => segment.split(" ").map((token, tokenIndex) => {
      if (segmentIndex === 0 && tokenIndex === 0) return "[a-z]+";
      return `(?:${token.split("/").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`;
    }).join("\\s+"));
    // Slots contain words, never sentence/clause punctuation. Keep all slot text visible.
    const slot = "(\\s+[a-z]+(?:['’-][a-z]+)*(?:\\s+[a-z]+(?:['’-][a-z]+)*)*?\\s+)";
    const pattern = new RegExp(`\\b(${patterns.join(`)${slot}(`)})\\b`, "iy");
    for (const verb of sentence.matchAll(/\b[a-z]+\b/gi)) {
      if (!roots.some((root) => isInflectedForm(verb[0], root))) continue;
      pattern.lastIndex = verb.index!;
      const match = pattern.exec(sentence);
      if (!match) continue;
      const captures = match.slice(1);
      return {
        sentence: sentence.slice(0, match.index) + captures.map((text, index) => index % 2 ? text : "_____").join("") + sentence.slice(match.index! + match[0].length),
        answer: captures.filter((_, index) => index % 2 === 0).join(" "),
      };
    }
    return { sentence, answer: target };
  }

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

  // Separated phrasal verbs with a pronoun object, e.g. “conned me out of”.
  if (targetParts.length > 1) {
    for (let start = 0; start < sentenceWords.length - targetParts.length; start += 1) {
      const verb = sentenceWords[start];
      const object = sentenceWords[start + 1];
      const tail = sentenceWords.slice(start + 2, start + 1 + targetParts.length);
      if (!targetParts[0].some((part) => isInflectedForm(verb[0], part))
        || !/^(me|you|him|her|it|us|them)$/i.test(object[0])
        || tail.length !== targetParts.length - 1
        || !tail.every((match, index) => targetParts[index + 1].includes(match[0].toLowerCase()))) continue;
      const last = tail[tail.length - 1];
      const end = last.index! + last[0].length;
      return {
        sentence: `${sentence.slice(0, verb.index)}_____${sentence.slice(verb.index! + verb[0].length, tail[0].index)}_____${sentence.slice(end)}`,
        answer: `${verb[0]} ${tail.map((match) => match[0]).join(" ")}`,
      };
    }
  }

  return { sentence, answer: target };
}

export function makeGapSentence(sentence: string, word: string): string {
  return makeGapQuestion(sentence, word).sentence;
}

export function maskTestAnswer(text: string, word: string, answer = word): string {
  for (const target of new Set([word, answer])) {
    if (!target.trim()) continue;
    const literal = target.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    text = text.replace(new RegExp(`(?<![a-z])${literal}(?![a-z])`, "gi"), "_____");
    let masked = makeGapQuestion(text, target).sentence;
    while (masked !== text) {
      text = masked;
      masked = makeGapQuestion(text, target).sentence;
    }
  }
  return text;
}

export function makeWordTestQuestion(
  word: Pick<WordDocument, "word" | "sentences" | "sentenceExplanations">,
  random = Math.random,
) {
  const matchingIndexes = word.sentences.flatMap((sentence, index) =>
    makeGapQuestion(sentence, word.word).sentence !== sentence ? [index] : [],
  );
  if (!matchingIndexes.length) {
    return { sentence: "", answer: word.word.replace(/\.{3,}|…/g, " ").trim().replace(/\s+/g, " "), sourceSentence: "", translation: "" };
  }
  const sentenceIndex = matchingIndexes[Math.floor(random() * matchingIndexes.length)] ?? 0;
  const sourceSentence = word.sentences[sentenceIndex] ?? "";
  return {
    ...makeGapQuestion(sourceSentence, word.word),
    sourceSentence,
    translation: word.sentenceExplanations[sentenceIndex] ?? "",
  };
}

export function getSpellingHint(answer: string): string {
  const normalized = answer.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
  const letters = [...normalized].filter((character) => /[a-z]/i.test(character));
  let shownFirst = false;
  return [...normalized].map((character) => {
    if (!/[a-z]/i.test(character)) return character;
    if (!shownFirst && letters.length >= 5) {
      shownFirst = true;
      return character;
    }
    return "_";
  }).join(" ");
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
