import type { LearningPlan } from "@/types";

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
