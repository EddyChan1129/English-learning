import assert from "node:assert/strict";
import test from "node:test";
import { emptyGuestData, makeGuestWord, mergeGuestData, parseGuestBackup, validateGuestWord } from "./guest-data.ts";
import { calculateTestUpdate } from "./spaced-repetition.ts";

const now = "2026-09-06T10:00:00.000Z";
const input = {
  word: "con … out of", chineseMeaning: "騙走", chineseMeanings: ["騙走"], synonyms: [],
  sentences: ["Heather conned me out of my last piece of gum.", "They conned her out of her money."],
  sentenceExplanations: ["騙走香口膠。", "騙走金錢。"], partsOfSpeech: ["phrasalVerb" as const], commonPhrases: [], categories: ["Study"],
};

test("guest vocabulary uses the same validation, due dates and stage updates", () => {
  const word = makeGuestWord(input, [], "first", now);
  assert.equal(word.stage, 0);
  assert.equal(word.nextTestDate, now);
  assert.throws(() => makeGuestWord({ ...input, word: "CON … OUT OF" }, [word], "second", now), /word-already-added/);
  assert.throws(() => validateGuestWord({ ...input, sentences: ["Unrelated sentence.", "Another sentence."] }, []), /invalid-examples/);
  const next = { ...word, ...calculateTestUpdate(word.stage, true, now), lastTestUsedHint: false };
  const backup = { ...emptyGuestData(), words: [next], target: { targetWords: 5, targetDays: 7, startDate: "2026-09-06" }, categories: ["Study"] };
  const restored = parseGuestBackup(JSON.parse(JSON.stringify(backup)));
  assert.equal(restored.words[0].stage, 1);
  assert.equal(restored.words[0].nextTestDate, "2026-09-07T10:00:00.000Z");
  assert.deepEqual(restored, backup);
});

test("invalid backups are rejected before any storage change", () => {
  const backup = { ...emptyGuestData(), words: [makeGuestWord(input, [], "first", now)] };
  for (const invalid of [null, {}, { ...backup, version: 2 }, { ...backup, words: [...backup.words, ...backup.words] },
    { ...backup, words: [{ ...backup.words[0], stage: 5 }] },
    { ...backup, words: [{ ...backup.words[0], nextTestDate: "not a date" }] },
    { ...backup, words: [{ ...backup.words[0], id: "../cloud" }] },
    { ...backup, attempts: [{ id: "bad", wordId: "missing" }] }]) {
    assert.throws(() => parseGuestBackup(invalid));
  }
  assert.equal(backup.words.length, 1);
});

test("backup merge preserves existing progress, remaps colliding IDs, and is retryable", () => {
  const word = makeGuestWord(input, [], "same-id", now);
  const current = { ...emptyGuestData(), words: [{ ...word, ...calculateTestUpdate(2, true, now) }], categories: ["Old"], target: { targetWords: 10, targetDays: 20, startDate: now } };
  const incoming = { ...emptyGuestData(), words: [word, { ...word, word: "mop", id: "same-id" }], categories: ["New"], target: { targetWords: 99, targetDays: 99, startDate: now } };
  const merged = mergeGuestData(current, incoming);
  assert.equal(merged.words.length, 2);
  assert.equal(merged.words[0].stage, 3);
  assert.equal(merged.words[0].status, "mastered");
  assert.notEqual(merged.words[0].id, merged.words[1].id);
  assert.deepEqual(merged.target, current.target);
  assert.deepEqual(merged.categories, ["Old", "New"]);
  assert.deepEqual(mergeGuestData(merged, incoming), merged);
  assert.equal(current.words.length, 1);
});

test("backup parsing strips account-specific metadata and clear state is independent", () => {
  const word = { ...makeGuestWord(input, [], "first", now), copiedFrom: { userId: "private", wordId: "cloud" }, normalizedWordKey: "cloud-key" };
  const backup = { ...emptyGuestData(), words: [word] };
  const parsed = parseGuestBackup(backup);
  assert.equal(parsed.words[0].copiedFrom, undefined);
  assert.equal(parsed.words[0].normalizedWordKey, undefined);
  const cleared = emptyGuestData();
  assert.deepEqual(cleared.words, []);
  assert.deepEqual(cleared.attempts, []);
  assert.equal(cleared.target, null);
  assert.equal(backup.words.length, 1);
});
