import assert from "node:assert/strict";
import test from "node:test";
import { calculateTestUpdate, isReadyForTest } from "./spaced-repetition.ts";

test("makes every untested Stage 0 card available immediately", () => {
  assert.equal(isReadyForTest({
    stage: 0,
    status: "learning",
    nextTestDate: "2026-08-25T10:11:12.000Z",
  }, new Date("2026-08-19T10:11:12.000Z")), true);
});

test("holds a failed Stage 0 card for thirty minutes before retrying", () => {
  const failed = calculateTestUpdate(0, false, "2026-08-19T10:11:12.000Z");
  assert.equal(isReadyForTest(failed, new Date("2026-08-19T10:40:12.000Z")), false);
  assert.equal(isReadyForTest(failed, new Date("2026-08-19T10:41:12.000Z")), true);
});

test("advances through all three successful passes", () => {
  assert.deepEqual(calculateTestUpdate(0, true, "2026-08-19T10:11:12.000Z"), {
    stage: 1,
    status: "learning",
    nextTestDate: "2026-08-21T10:11:12.000Z",
    lastTestedAt: "2026-08-19T10:11:12.000Z",
  });
  assert.equal(calculateTestUpdate(1, true, "2026-08-19T10:11:12.000Z").nextTestDate, "2026-08-23T10:11:12.000Z");
  assert.deepEqual(calculateTestUpdate(2, true, "2026-08-19T10:11:12.000Z"), {
    stage: 3,
    status: "mastered",
    nextTestDate: "2026-08-19T10:11:12.000Z",
    lastTestedAt: "2026-08-19T10:11:12.000Z",
  });
});

test("failure keeps every stage and schedules another test thirty minutes later", () => {
  assert.deepEqual(calculateTestUpdate(2, false, "2026-08-19T10:11:12.000Z"), {
    stage: 2,
    status: "learning",
    nextTestDate: "2026-08-19T10:41:12.000Z",
    lastTestedAt: "2026-08-19T10:11:12.000Z",
  });
  for (const stage of [0, 1, 2, 3] as const) {
    assert.equal(calculateTestUpdate(stage, false, "2026-08-19T10:11:12.000Z").stage, stage);
  }
});
