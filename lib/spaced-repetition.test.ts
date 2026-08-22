import assert from "node:assert/strict";
import test from "node:test";
import { calculateTestUpdate } from "./spaced-repetition.ts";

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

test("failure drops one stage and schedules another test thirty minutes later", () => {
  assert.deepEqual(calculateTestUpdate(2, false, "2026-08-19T10:11:12.000Z"), {
    stage: 1,
    status: "learning",
    nextTestDate: "2026-08-19T10:41:12.000Z",
    lastTestedAt: "2026-08-19T10:11:12.000Z",
  });
  assert.equal(calculateTestUpdate(0, false, "2026-08-19T10:11:12.000Z").stage, 0);
  assert.equal(calculateTestUpdate(3, false, "2026-08-19T10:11:12.000Z").stage, 2);
});
