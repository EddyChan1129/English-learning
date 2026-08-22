import assert from "node:assert/strict";
import test from "node:test";
import { addDaysToTimestamp, addMinutesToTimestamp, isDue } from "./date.ts";

test("schedules exact timestamps and accepts legacy date-only values", () => {
  assert.equal(addDaysToTimestamp("2026-08-19T10:11:12.000Z", 2), "2026-08-21T10:11:12.000Z");
  assert.equal(addDaysToTimestamp("2026-08-22T13:42:00+08:00", 2), "2026-08-24T05:42:00.000Z");
  assert.equal(isDue("2026-08-19", new Date("2026-08-21T00:00:00.000Z")), true);
  assert.equal(isDue("2026-08-23T10:11:12.000Z", new Date("2026-08-21T00:00:00.000Z")), false);
});

test("schedules incorrect answers thirty minutes later", () => {
  assert.equal(addMinutesToTimestamp("2026-08-22T13:42:00+08:00", 30), "2026-08-22T06:12:00.000Z");
});
