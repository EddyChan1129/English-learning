import assert from "node:assert/strict";
import test from "node:test";
import { calculateTestUpdate } from "./spaced-repetition.ts";

test("advances through all three successful passes", () => {
  assert.deepEqual(calculateTestUpdate(0, true, "2026-08-19"), {
    stage: 1,
    status: "learning",
    nextTestDate: "2026-08-21",
    lastTestedAt: "2026-08-19",
  });
  assert.equal(calculateTestUpdate(1, true, "2026-08-19").nextTestDate, "2026-08-23");
  assert.deepEqual(calculateTestUpdate(2, true, "2026-08-19"), {
    stage: 3,
    status: "mastered",
    nextTestDate: "2026-08-19",
    lastTestedAt: "2026-08-19",
  });
});

test("failure keeps the current stage and schedules three days later", () => {
  assert.deepEqual(calculateTestUpdate(2, false, "2026-08-19"), {
    stage: 2,
    status: "learning",
    nextTestDate: "2026-08-22",
    lastTestedAt: "2026-08-19",
  });
});
