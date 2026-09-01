import assert from "node:assert/strict";
import test from "node:test";
import { parseSentenceEvaluation } from "./sentence-evaluation.ts";

test("accepts a valid structured sentence evaluation", () => {
  assert.deepEqual(parseSentenceEvaluation({
    verdict: "correct_with_feedback",
    correctedSentence: "I go to school by bus.",
    feedback: "Add ‘to’ before ‘school’. Your meaning was clear.",
    targetWordUsed: true,
  }, "test-model"), {
    verdict: "correct_with_feedback",
    correctedSentence: "I go to school by bus.",
    feedback: "Add ‘to’ before ‘school’. Your meaning was clear.",
    targetWordUsed: true,
    model: "test-model",
  });
});

test("forces missing target vocabulary to incorrect", () => {
  assert.equal(parseSentenceEvaluation(JSON.stringify({
    verdict: "correct",
    correctedSentence: "I travel by bus.",
    feedback: "The sentence is correct.",
    targetWordUsed: false,
  }))?.verdict, "incorrect");
});

test("rejects malformed AI output", () => {
  assert.equal(parseSentenceEvaluation("not json"), null);
  assert.equal(parseSentenceEvaluation({ verdict: "maybe" }), null);
});

test("accepts JSON wrapped in a Markdown code fence", () => {
  assert.equal(parseSentenceEvaluation(`\`\`\`json
{"verdict":"correct","correctedSentence":"I go to school.","feedback":"Good sentence.","targetWordUsed":true}
\`\`\``)?.verdict, "correct");
});
