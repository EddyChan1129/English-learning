import type { Metadata } from "next";
import { LearningPlansCatalogue } from "@/components/LearningPlansCatalogue";

export const metadata: Metadata = {
  title: "Vocabulary Plans · Fowl to Phoenix",
  description: "Choose a structured English vocabulary learning plan.",
};

export default function VocabularyPlansPage() {
  return <LearningPlansCatalogue />;
}
