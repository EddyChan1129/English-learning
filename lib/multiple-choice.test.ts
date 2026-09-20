import test from "node:test";
import assert from "node:assert/strict";
import { makeMultipleChoice } from "./multiple-choice.ts";

const word = (id: string, term: string, meaning: string, synonyms: string[] = []) => ({
  id, word: term, chineseMeaning: meaning, chineseMeanings: [meaning], synonyms,
  partsOfSpeech: ["verb" as const], status: "learning" as const,
});
const target = word("go", "go", "去", ["depart"]);
const valid = [word("grow", "grow", "生長"), word("generate", "generate", "產生"), word("give", "give", "給予")];

test("MC includes one correct ID and three unique safe distractors", () => {
  const pool = [target, ...valid, word("duplicate", "GO", "前往"), word("syn", "depart", "離開"), word("reverse", "leave", "離開", ["go"]), word("overlap", "travel", "去旅行"), { ...word("inactive", "get", "取得"), status: "inactive" as const }];
  for (let i = 0; i < 20; i++) {
    const choices = makeMultipleChoice(target, pool);
    assert.ok(choices);
    assert.deepEqual(choices.map((choice) => choice.id).sort(), ["go", "grow", "generate", "give"].sort());
  }
  assert.equal(pool[0], target);
});

test("MC falls back when safe distinct options or meanings are missing", () => {
  assert.equal(makeMultipleChoice(target, valid.slice(0, 2)), null);
  assert.equal(makeMultipleChoice(target, [valid[0], valid[0], valid[1]]), null);
  assert.equal(makeMultipleChoice(word("blank", "blank", ""), valid), null);
});
