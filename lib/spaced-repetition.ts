import type { Stage, WordDocument } from "@/types";
import { addDays } from "./date.ts";

export type TestUpdate = Pick<
  WordDocument,
  "stage" | "status" | "nextTestDate" | "lastTestedAt"
>;

export function calculateTestUpdate(
  stage: Stage,
  passed: boolean,
  today: string,
): TestUpdate {
  if (!passed) {
    return {
      stage,
      status: stage === 3 ? "mastered" : "learning",
      nextTestDate: addDays(today, 3),
      lastTestedAt: today,
    };
  }

  const nextStage = Math.min(stage + 1, 3) as Stage;
  return {
    stage: nextStage,
    status: nextStage === 3 ? "mastered" : "learning",
    nextTestDate:
      nextStage === 3 ? today : addDays(today, nextStage === 1 ? 2 : 4),
    lastTestedAt: today,
  };
}
