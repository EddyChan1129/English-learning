import assert from "node:assert/strict";
import test from "node:test";
import { countNewWordsByLocalDate } from "./history.ts";

test("counts each vocabulary card once on its local creation date", () => {
  const firstDayMorning = new Date(2026, 7, 22, 10).toISOString();
  const firstDayEvening = new Date(2026, 7, 22, 21).toISOString();
  const secondDay = new Date(2026, 7, 23, 1).toISOString();

  const counts = countNewWordsByLocalDate([
    { createdAt: firstDayMorning },
    { createdAt: firstDayEvening },
    { createdAt: secondDay },
    {},
  ]);

  assert.deepEqual([...counts.values()], [2, 1]);
});
