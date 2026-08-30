import assert from "node:assert/strict";
import test from "node:test";
import { getLearningTargetProgress } from "./learning-target.ts";

const words = [
  { status: "mastered" as const },
  { status: "mastered" as const },
  { status: "mastered" as const },
  { status: "learning" as const },
];

test("tracks only new mastery and expires after the target's final day", () => {
  const target = { targetWords: 2, targetDays: 3, startDate: "2026-08-01", startingMastered: 1 };

  assert.deepEqual(getLearningTargetProgress(target, words, "2026-08-03"), {
    mastered: 2,
    complete: true,
    expired: false,
  });
  assert.equal(getLearningTargetProgress(target, words, "2026-08-04").expired, true);
});
