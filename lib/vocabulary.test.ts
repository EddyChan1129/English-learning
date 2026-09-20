import assert from "node:assert/strict";
import test from "node:test";
import { normalizeVocabularyKey } from "./vocabulary.ts";

test("normalizes harmless vocabulary formatting differences", () => {
  assert.equal(normalizeVocabularyKey(" Withstand "), "withstand");
  assert.equal(normalizeVocabularyKey("Used   To\tBe"), "used to be");
});

test("keeps genuinely different vocabulary entries distinct", () => {
  assert.notEqual(normalizeVocabularyKey("use"), normalizeVocabularyKey("used to"));
  assert.notEqual(normalizeVocabularyKey("used to"), normalizeVocabularyKey("used to be"));
});
