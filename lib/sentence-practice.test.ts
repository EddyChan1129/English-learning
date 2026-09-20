import assert from "node:assert/strict";
import test from "node:test";
import { isSentencePracticeEligible, sortSentenceWords } from "./sentence-practice.ts";

const words = [
  { id: "b", word: "balance", nextTestDate: "2026-09-06T09:00:00.000Z", status: "learning" as const },
  { id: "a", word: "adapt", nextTestDate: "2026-09-05T09:00:00.000Z", status: "learning" as const },
  { id: "c", word: "clarity", nextTestDate: "2026-09-07T09:00:00.000Z", status: "learning" as const },
];
const datedWords = [...words, { id: "d", word: "done", nextTestDate: "2026-09-01T09:00:00.000Z", status: "mastered" as const }];
const scores = new Map([["a", 9], ["b", 4]]);

test("sorts sentence cards by practice state and score", () => {
  assert.deepEqual(sortSentenceWords(words, scores, "unpractised").map(({ id }) => id), ["c", "a", "b"]);
  assert.deepEqual(sortSentenceWords(words, scores, "scoreLow").map(({ id }) => id), ["b", "a", "c"]);
  assert.deepEqual(sortSentenceWords(words, scores, "scoreHigh").map(({ id }) => id), ["a", "b", "c"]);
  assert.deepEqual(sortSentenceWords(datedWords, scores, "testSoonest").map(({ id }) => id), ["a", "b", "c", "d"]);
  assert.deepEqual(sortSentenceWords(datedWords, scores, "testLatest").map(({ id }) => id), ["c", "b", "a", "d"]);
});

test("allows every active learning stage to practise sentences", () => {
  for (const stage of [0, 1, 2, 3] as const) {
    assert.equal(isSentencePracticeEligible({ stage, status: stage === 3 ? "mastered" : "learning" }), true);
  }
  assert.equal(isSentencePracticeEligible({ stage: 2, status: "inactive" }), false);
});
