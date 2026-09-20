import { ESSENTIAL_EXAMPLE_TRANSLATIONS } from "./essential-example-translations.ts";
import { ESSENTIAL_SECOND_EXAMPLES } from "./essential-second-examples.ts";
import type { EssentialPhrasalVerb } from "./essential-phrasal-verbs.ts";
import type { LearningPlanEntry } from "@/types";

function makeSearchTokens(values: string[]) {
  const tokens = new Set<string>();
  for (const value of values) {
    const normalized = value.trim().toLocaleLowerCase();
    if (!normalized) continue;
    tokens.add(normalized);
    for (const word of normalized.split(/[\s、，,/]+/)) {
      if (word) tokens.add(word);
    }
  }
  return [...tokens];
}

export function essentialEntryToLearningPlanEntry(entry: EssentialPhrasalVerb): LearningPlanEntry {
  const index = entry.id - 1;
  const translations = ESSENTIAL_EXAMPLE_TRANSLATIONS[index];
  return {
    id: String(entry.id),
    order: entry.id,
    term: entry.phrase,
    englishDefinition: entry.definition,
    chineseMeanings: entry.chinese.split(/[、；]/).map((meaning) => meaning.trim()).filter(Boolean),
    synonyms: entry.synonyms,
    examples: [
      { english: entry.example, chinese: translations[0] },
      { english: ESSENTIAL_SECOND_EXAMPLES[index], chinese: translations[1] },
    ],
    partsOfSpeech: ["phrasalVerb"],
    searchTokens: makeSearchTokens([entry.phrase, entry.definition, entry.chinese, ...entry.synonyms]),
  };
}
