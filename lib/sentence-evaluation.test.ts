import assert from "node:assert/strict";
import test from "node:test";
import { parseSentenceEvaluation } from "./sentence-evaluation.ts";

const validEvaluation = {
  verdict: "correct_with_feedback",
  score: 7,
  correctedSentence: "I go to school by bus.",
  feedback: "You used ‘go’ correctly. Add ‘to’ before ‘school’ because destinations need this preposition. Keep using ‘go to’ for places.",
  translation: "我乘巴士返學。",
  sentenceStructure: "Subject + go to + place + by + transport",
  structureExplanation: "先講邊個出發，再講目的地，最後用 by 補充交通工具。",
  learningPoints: [{
    phrase: "go to school",
    pattern: "go to + place",
    meaning: "去某個地方",
    explanation: "用 go to 加地點，表達前往某處。",
    example: "We go to the library after class.",
  }],
  targetWordUsed: true,
} as const;

test("accepts a valid structured sentence evaluation", () => {
  assert.deepEqual(parseSentenceEvaluation(validEvaluation, "test-model"), {
    ...validEvaluation,
    learningPoints: validEvaluation.learningPoints.map((point) => ({ ...point })),
    model: "test-model",
  });
});

test("normalizes the smaller flat AI response", () => {
  const result = parseSentenceEvaluation({
    score: 8,
    correctedSentence: "I think you should wear a coat because it is cold outside.",
    feedback: "Coat is used correctly. Remove the unnecessary comma before because.",
    translation: "我覺得你應該穿外套，因為外面很冷。",
    sentencePattern: "should + base verb",
    patternPhrase: "should wear",
    patternMeaning: "應該做某事",
    patternExplanation: "用 should 加動詞原形表達建議。",
    patternExample: "You should bring an umbrella.",
    targetWordUsed: true,
  });

  assert.equal(result?.sentenceStructure, "should + base verb");
  assert.deepEqual(result?.learningPoints, [{
    phrase: "should wear",
    pattern: "should + base verb",
    meaning: "應該做某事",
    explanation: "用 should 加動詞原形表達建議。",
    example: "You should bring an umbrella.",
  }]);
});

test("forces missing target vocabulary to incorrect", () => {
  assert.equal(parseSentenceEvaluation({
    ...validEvaluation,
    verdict: "correct",
    score: 10,
    correctedSentence: "I travel by bus.",
    targetWordUsed: false,
  })?.verdict, "incorrect");
});

test("rejects malformed AI output and incomplete learning points", () => {
  assert.equal(parseSentenceEvaluation("not json"), null);
  assert.equal(parseSentenceEvaluation({ verdict: "maybe" }), null);
  assert.equal(parseSentenceEvaluation({ ...validEvaluation, learningPoints: [] }), null);
  assert.equal(parseSentenceEvaluation({
    ...validEvaluation,
    learningPoints: [{ ...validEvaluation.learningPoints[0], example: "" }],
  }), null);
});

test("keeps scores inside the verdict band", () => {
  assert.equal(parseSentenceEvaluation({
    ...validEvaluation,
    verdict: "incorrect",
    score: 9,
    correctedSentence: "I go to school every weekday.",
  })?.score, 6);
});

test("accepts JSON wrapped in a Markdown code fence", () => {
  assert.equal(parseSentenceEvaluation(`\`\`\`json
${JSON.stringify({ ...validEvaluation, verdict: "correct", score: 10 })}
\`\`\``)?.verdict, "correct");
});
