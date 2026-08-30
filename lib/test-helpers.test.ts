import assert from "node:assert/strict";
import test from "node:test";
import { getSpellingHint, getSpellingHintCharacters, isWordAnswerCorrect, makeGapQuestion, makeGapSentence, makeWordTestQuestion, shuffled } from "./test-helpers.ts";

test("supports multi-word targets in gap-fill tests", () => {
  assert.equal(makeGapSentence("I used to be very shy.", "used to be"), "I _____ very shy.");
  assert.equal(isWordAnswerCorrect("Managed to", "managed to"), true);
});

test("uses the complete inflected word as the gap answer", () => {
  assert.deepEqual(
    makeGapQuestion("The system was breached by hackers.", "breach"),
    { sentence: "The system was _____ by hackers.", answer: "breached" },
  );
  assert.equal(isWordAnswerCorrect("breached", makeGapQuestion("The system was breached.", "breach").answer), true);
});

test("finds regular, irregular, and slash alternatives in phrasal-verb examples", () => {
  assert.deepEqual(
    makeGapQuestion("Grace chickened out before it was her turn.", "Chicken Out"),
    { sentence: "Grace _____ before it was her turn.", answer: "chickened out" },
  );
  assert.deepEqual(
    makeGapQuestion("The shelving was built in.", "Build In/Into"),
    { sentence: "The shelving was _____.", answer: "built in" },
  );
});

test("keeps the matching translation and full sentence with a gap-fill question", () => {
  assert.deepEqual(makeWordTestQuestion({
    word: "mop",
    sentences: ["This sentence has no target.", "Use the mop to clean the wet floor."],
    sentenceExplanations: ["呢句冇目標字。", "用地拖清潔濕咗嘅地板。"],
  }), {
    sentence: "Use the _____ to clean the wet floor.",
    answer: "mop",
    sourceSentence: "Use the mop to clean the wet floor.",
    translation: "用地拖清潔濕咗嘅地板。",
  });
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

test("marks each hidden spelling position as the user types", () => {
  assert.deepEqual(
    getSpellingHintCharacters("user", "us").map(({ character, state }) => `${character}:${state}`),
    ["u:shown", "_:correct", "_:pending", "r:shown"],
  );
  assert.equal(getSpellingHintCharacters("user", "ux")[1].state, "incorrect");
});
