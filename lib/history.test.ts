import assert from "node:assert/strict";
import test from "node:test";
import { compareHistoryWords, countNewWordsByLocalDate, DEFAULT_HISTORY_WORD_ORDER } from "./history.ts";

test("defaults history to the soonest upcoming test", () => {
  assert.equal(DEFAULT_HISTORY_WORD_ORDER, "testSoonest");
});

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

test("sorts dated entries and keeps non-learning cards after upcoming tests", () => {
  const entries = [
    { word: "later", partsOfSpeech: [], status: "learning", createdAt: "2026-08-20", nextTestDate: "2026-08-25" },
    { word: "paused", partsOfSpeech: [], status: "inactive", createdAt: "2026-08-22", nextTestDate: "2026-08-23" },
    { word: "sooner", partsOfSpeech: [], status: "learning", createdAt: "2026-08-21", nextTestDate: "2026-08-24" },
  ];

  assert.deepEqual(entries.toSorted((a, b) => compareHistoryWords(a, b, "newest")).map(({ word }) => word), ["paused", "sooner", "later"]);
  assert.deepEqual(entries.toSorted((a, b) => compareHistoryWords(a, b, "testSoonest")).map(({ word }) => word), ["sooner", "later", "paused"]);
});
