import assert from "node:assert/strict";
import test from "node:test";
import { getSpellingHint, isWordAnswerCorrect, makeGapSentence, shuffled } from "./test-helpers.ts";

test("supports multi-word targets in gap-fill tests", () => {
  assert.equal(makeGapSentence("I used to be very shy.", "used to be"), "I _____ very shy.");
  assert.equal(isWordAnswerCorrect("Managed to", "managed to"), true);
});

test("shuffles a copy without changing the source list", () => {
  const source = [1, 2, 3, 4];

  assert.deepEqual(shuffled(source, () => 0), [2, 3, 4, 1]);
  assert.deepEqual(source, [1, 2, 3, 4]);
});

test("shows only the first and last alphabetic characters in spelling hints", () => {
  assert.equal(getSpellingHint("withstand"), "w_______d");
  assert.equal(getSpellingHint("environment"), "e_________t");
  assert.equal(getSpellingHint("used to be"), "u________e");
});
