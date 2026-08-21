import type { Stage, WordDocument } from "@/types";
import { addDaysToTimestamp } from "./date.ts";

export type TestUpdate = Pick<
  WordDocument,
  "stage" | "status" | "nextTestDate" | "lastTestedAt"
>;

export function calculateTestUpdate(
  stage: Stage,
  passed: boolean,
  testedAt: string,
): TestUpdate {
  if (!passed) {
    return {
      stage,
      status: stage === 3 ? "mastered" : "learning",
      nextTestDate: addDaysToTimestamp(testedAt, 3),
      lastTestedAt: testedAt,
    };
  }

  const nextStage = Math.min(stage + 1, 3) as Stage;
  return {
    stage: nextStage,
    status: nextStage === 3 ? "mastered" : "learning",
    nextTestDate:
      nextStage === 3 ? testedAt : addDaysToTimestamp(testedAt, nextStage === 1 ? 2 : 4),
    lastTestedAt: testedAt,
  };
}
