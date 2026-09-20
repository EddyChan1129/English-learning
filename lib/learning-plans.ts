import { normalizeVocabularyKey } from "./vocabulary.ts";
import type { LearningPlan, LearningPlanEntry, PartOfSpeech } from "@/types";

export type LearningPlanEntryFilters = {
  query: string;
  order: "az" | "za";
  part: "all" | PartOfSpeech;
  saved: "all" | "saved" | "unsaved";
  dueOnly: boolean;
  savedKeys: ReadonlySet<string>;
  dueKeys: ReadonlySet<string>;
};

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

export function getFallbackPlan(slug: string) {
  return FALLBACK_LEARNING_PLANS.find((plan) => plan.slug === slug) ?? null;
}

export function filterLearningPlanEntries(entries: LearningPlanEntry[], filters: LearningPlanEntryFilters) {
  const search = filters.query.trim().toLocaleLowerCase();
  return entries
    .filter((entry) => {
      const key = normalizeVocabularyKey(entry.term);
      const saved = filters.savedKeys.has(key);
      const matchesSearch = !search || [entry.term, entry.englishDefinition, ...entry.chineseMeanings, ...entry.synonyms]
        .join(" ").toLocaleLowerCase().includes(search);
      const matchesPart = filters.part === "all" || entry.partsOfSpeech.includes(filters.part);
      const matchesSaved = filters.saved === "all" || (filters.saved === "saved" ? saved : !saved);
      return matchesSearch && matchesPart && matchesSaved && (!filters.dueOnly || filters.dueKeys.has(key));
    })
    .sort((a, b) => (filters.order === "az" ? 1 : -1) * a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
}
