import assert from "node:assert/strict";
import test from "node:test";
import { addDaysToTimestamp, isDue } from "./date.ts";

test("schedules exact timestamps and accepts legacy date-only values", () => {
  assert.equal(addDaysToTimestamp("2026-08-19T10:11:12.000Z", 2), "2026-08-21T10:11:12.000Z");
  assert.equal(isDue("2026-08-19", new Date("2026-08-21T00:00:00.000Z")), true);
  assert.equal(isDue("2026-08-23T10:11:12.000Z", new Date("2026-08-21T00:00:00.000Z")), false);
});
