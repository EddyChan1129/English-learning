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

test("allows words without a useful synonym but still requires a valid array", () => {
  const input = { ...validInput, entries: [{ ...validInput.entries[0], synonyms: [] }] };
  assert.deepEqual(makeLearningPlanUpload(input).entries[0].synonyms, []);
  for (const synonyms of [undefined, "", [""], Array(11).fill("skill")]) {
    assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: [{ ...input.entries[0], synonyms }] }), /synonyms/);
  }
});

test("rejects incomplete or duplicate learning entries", () => {
  assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: [] }), /between 1 and 2000/);
  assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: Array(2_001).fill(validInput.entries[0]) }), /between 1 and 2000/);
  assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: [validInput.entries[0], validInput.entries[0]] }), /Duplicate term/);
  assert.throws(() => makeLearningPlanUpload({
    ...validInput,
    entries: [{ ...validInput.entries[0], examples: validInput.entries[0].examples.slice(0, 1) }],
  }), /between 2 and 100/);
});

test("checks uploaded examples with the same ellipsis matcher used for quizzes", () => {
  const entry = { ...validInput.entries[0], term: "con ... out of", examples: [
    { english: "Heather conned me out of my gum.", chinese: "希瑟呃走我嘅香口膠。" },
    { english: "An unrelated sentence.", chinese: "無關例句。" },
  ] };
  assert.equal(makeLearningPlanUpload({ ...validInput, entries: [entry] }).entries[0].term, "con ... out of");
  assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: [{ ...entry, examples: [entry.examples[1], entry.examples[1]] }] }), /entries\[0\].*con \.\.\. out of.*examples do not match/);
});


test("preserves extra examples and validates every pair", () => {
  const base = validInput.entries[0];
  const examples = [...base.examples, { english: "I have the ability to learn.", chinese: "我有學習能力。" }];
  const input = { ...validInput, entries: [{ ...base, examples }] };
  assert.deepEqual(makeLearningPlanUpload(input).entries[0].examples, examples);
  assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: [{ ...base, examples: [...examples, { english: "Another example.", chinese: "" }] }] }), /examples\[3\].chinese/);
  assert.throws(() => makeLearningPlanUpload({ ...validInput, entries: [{ ...base, examples: Array(101).fill(examples[0]) }] }), /between 2 and 100/);
});

test("requires two distinct examples per labeled meaning, not just two per word", () => {
  const base = validInput.entries[0];
  const label = { sense: "skill", meaning: "能力", pattern: "ability to + verb" };
  const examples = base.examples.map((example) => ({ ...example, ...label }));
  const upload = (pairs: unknown[]) => makeLearningPlanUpload({ ...validInput, entries: [{ ...base, examples: pairs }] });
  assert.deepEqual(upload(examples).entries[0].examples, examples);
  assert.throws(() => upload([examples[0], { ...examples[1], sense: "other" }]), /two distinct examples/);
  assert.throws(() => upload([examples[0], examples[0]]), /two distinct examples/);
  assert.throws(() => upload([examples[0], { ...examples[1], meaning: "其他" }]), /inconsistent/);
  assert.throws(() => upload([examples[0], { ...examples[1], pattern: "other pattern" }]), /inconsistent/);
  assert.throws(() => upload([examples[0], base.examples[1]]), /every example/);
  assert.throws(() => upload([examples[0], { ...examples[1], pattern: undefined }]), /pattern/);
});
