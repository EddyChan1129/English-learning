import type { EssentialPhrasalVerb } from "./essential-phrasal-verbs";
import type { LearningPlan, LearningPlanEntry } from "@/types";

export const ESSENTIAL_PLAN_ID = "200-essential-phrasal-verbs";

export const FALLBACK_LEARNING_PLANS: LearningPlan[] = [
  {
    id: ESSENTIAL_PLAN_ID,
    slug: ESSENTIAL_PLAN_ID,
    title: { en: "200 Essentials", zh: "200 必學短語動詞" },
    description: {
      en: "A focused collection of practical phrasal verbs for everyday English.",
      zh: "集中學習日常英語最實用嘅 200 個短語動詞。",
    },
    level: { en: "Essential", zh: "必學" },
    entryCount: 200,
    order: 1,
    featured: true,
    published: true,
  },
];

export function makeSearchTokens(values: string[]) {
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
  const phrase = entry.phrase.replace("/Into", " Into");
  const phraseLower = phrase.toLocaleLowerCase();
  const chineseExplanation = `「${entry.phrase}」喺呢句表示「${entry.chinese}」。`;
  return {
    id: String(entry.id),
    order: entry.id,
    term: entry.phrase,
    englishDefinition: entry.definition,
    chineseMeanings: entry.chinese.split(/[、；]/).map((meaning) => meaning.trim()).filter(Boolean),
    synonyms: entry.synonyms,
    examples: [
      { english: entry.example, chinese: chineseExplanation },
      {
        english: `“${phrase}” is useful when you want ${entry.definition.replace(/^To\s+/i, "to ").replace(/\.$/, "").toLocaleLowerCase()}.`,
        chinese: `呢句用「${phraseLower}」說明可以表達「${entry.chinese}」呢個意思。`,
      },
    ],
    partsOfSpeech: ["phrasalVerb"],
    searchTokens: makeSearchTokens([entry.phrase, entry.definition, entry.chinese, ...entry.synonyms]),
  };
}

export function getFallbackPlan(slug: string) {
  return FALLBACK_LEARNING_PLANS.find((plan) => plan.slug === slug) ?? null;
}
