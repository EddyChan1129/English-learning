import { daysElapsed } from "./date.ts";
import type { UserTarget, WordDocument } from "../types/index.ts";

export function getLearningTargetProgress(
  target: UserTarget,
  words: ReadonlyArray<Pick<WordDocument, "status">>,
  today?: string,
) {
  const totalMastered = words.filter((word) => word.status === "mastered").length;
  const mastered = Math.max(0, totalMastered - (target.startingMastered ?? 0));
  return {
    mastered,
    complete: mastered >= target.targetWords,
    expired: daysElapsed(target.startDate, today) > target.targetDays,
  };
}
