import type { Metadata } from "next";
import { LearningPlanLibrary } from "@/components/LearningPlanLibrary";

export const metadata: Metadata = {
  title: "Vocabulary Plan · Fowl to Phoenix",
  description: "Study a curated English vocabulary plan.",
};

export default async function VocabularyPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LearningPlanLibrary slug={slug} />;
}
