import assert from "node:assert/strict";
import test from "node:test";
import { makeLearningPlanUpload } from "./learning-plan-upload.ts";

const validInput = {
  id: "simple-english-1000",
  slug: "1000-simple-english-words",
  title: { en: "1000 Simple English Words", zh: "1000 個簡單英語單詞" },
  description: { en: "A beginner collection.", zh: "初學者詞彙集。" },
  level: { en: "Beginner", zh: "初級" },
  order: 2,
  featured: true,
  entries: [{
    term: "ability",
    englishDefinition: "The power or skill to do something.",
    chineseMeanings: ["能力"],
    synonyms: ["skill", "capacity"],
    partsOfSpeech: ["noun"],
    examples: [
      { english: "She has the ability to explain difficult ideas clearly.", chinese: "她有能力清楚解釋困難的概念。" },
      { english: "Practice improves your ability to speak English.", chinese: "練習可以提升你說英語的能力。" },
    ],
  }],
};

test("normalizes a learning-plan upload and derives entry metadata", () => {
  const { plan, entries } = makeLearningPlanUpload(validInput);
  assert.equal(plan.entryCount, 1);
  assert.equal(plan.published, true);
  assert.equal(entries[0].id, "1");
  assert.equal(entries[0].order, 1);
  assert.ok(entries[0].searchTokens.includes("ability"));
});

test("preserves readable phrase categories as supported grammar roles", () => {
  const { entries } = makeLearningPlanUpload({
    ...validInput,
    entries: [{ ...validInput.entries[0], partsOfSpeech: ["prepositional phrase", "collocation"] }],
  });
  assert.deepEqual(entries[0].partsOfSpeech, ["prepositionalPhrase", "collocation"]);
});

test("rejects incomplete or duplicate learning entries", () => {
  assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: [] }), /between 1 and 2000/);
  assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: Array(2_001).fill(validInput.entries[0]) }), /between 1 and 2000/);
  assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: [validInput.entries[0], validInput.entries[0]] }), /Duplicate term/);
  assert.throws(() => makeLearningPlanUpload({
    ...validInput,
    entries: [{ ...validInput.entries[0], examples: validInput.entries[0].examples.slice(0, 1) }],
  }), /exactly two/);
});
