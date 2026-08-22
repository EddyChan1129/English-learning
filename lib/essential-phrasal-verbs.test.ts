import assert from "node:assert/strict";
import test from "node:test";
import { ESSENTIAL_PHRASAL_VERBS } from "./essential-phrasal-verbs.ts";
import { essentialEntryToLearningPlanEntry } from "./essential-learning-plan.ts";

test("contains 200 complete, uniquely numbered phrasal verbs", () => {
  assert.equal(ESSENTIAL_PHRASAL_VERBS.length, 200);
  assert.deepEqual(ESSENTIAL_PHRASAL_VERBS.map(({ id }) => id), Array.from({ length: 200 }, (_, index) => index + 1));
  assert.equal(new Set(ESSENTIAL_PHRASAL_VERBS.map(({ phrase }) => phrase.toLowerCase())).size, 200);
  for (const entry of ESSENTIAL_PHRASAL_VERBS) {
    assert.ok(entry.phrase && entry.definition && entry.chinese && entry.synonyms.length && entry.example);
    assert.doesNotMatch(`${entry.phrase}${entry.definition}${entry.example}`, /[\[\]]/);
    assert.doesNotMatch(entry.example, /(?:ti|lef)\.?$/i);
  }
});

test("adapts every entry to two bilingual examples for learning plans", () => {
  for (const source of ESSENTIAL_PHRASAL_VERBS) {
    const entry = essentialEntryToLearningPlanEntry(source);
    assert.equal(entry.examples.length, 2);
    assert.ok(entry.examples.every((example) => example.english.trim() && example.chinese.trim()));
    assert.ok(entry.examples.every((example) => !example.chinese.includes("呢句用")));
    assert.notEqual(entry.examples[0].english, entry.examples[1].english);
  }
});
