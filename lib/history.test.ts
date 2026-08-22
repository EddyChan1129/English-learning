import assert from "node:assert/strict";
import test from "node:test";
import { compareHistoryWords, countNewWordsByLocalDate } from "./history.ts";

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

test("sorts history entries by word type before alphabetically", () => {
  const entries = [
    { word: "before", partsOfSpeech: ["preposition" as const] },
    { word: "severe", partsOfSpeech: ["adjective" as const] },
    { word: "breach", partsOfSpeech: ["verb" as const, "noun" as const] },
  ];
  assert.deepEqual(entries.toSorted((a, b) => compareHistoryWords(a, b, "part")).map(({ word }) => word), ["breach", "severe", "before"]);
});
