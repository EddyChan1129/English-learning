import type { SentenceEvaluation, SentenceLearningPoint, SentenceVerdict } from "@/types";

const VERDICTS = new Set<SentenceVerdict>(["correct", "correct_with_feedback", "incorrect"]);

export const SENTENCE_EVALUATION_MODEL = "@cf/google/gemma-4-26b-a4b-it";

export const SENTENCE_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      minimum: 1,
      maximum: 10,
      description: "Overall sentence score. 9-10 correct, 7-8 correct_with_feedback, 1-6 incorrect.",
    },
    correctedSentence: {
      type: "string",
      minLength: 12,
      maxLength: 500,
      description: "One polished, natural sentence preserving the learner's intended meaning, usually 12-25 words.",
    },
    feedback: {
      type: "string",
      minLength: 20,
      maxLength: 500,
      description: "Concise feedback covering target usage and the most important correction.",
    },
    translation: {
      type: "string",
      minLength: 2,
      maxLength: 500,
      description: "A natural translation or plain-language meaning of correctedSentence in the requested explanation language.",
    },
    sentencePattern: {
      type: "string",
      minLength: 2,
      maxLength: 160,
      description: "One reusable formula from correctedSentence, such as should + base verb.",
    },
    patternPhrase: {
      type: "string",
      minLength: 1,
      maxLength: 120,
      description: "The exact phrase in correctedSentence that demonstrates sentencePattern.",
    },
    patternMeaning: { type: "string", minLength: 1, maxLength: 160 },
    patternExplanation: {
      type: "string",
      minLength: 5,
      maxLength: 300,
      description: "How to understand and reuse sentencePattern, in the requested explanation language.",
    },
    patternExample: { type: "string", minLength: 5, maxLength: 240 },
    targetWordUsed: { type: "boolean" },
  },
  required: [
    "score",
    "correctedSentence",
    "feedback",
    "translation",
    "sentencePattern",
    "patternPhrase",
    "patternMeaning",
    "patternExplanation",
    "patternExample",
    "targetWordUsed",
  ],
  additionalProperties: false,
} as const;

export function parseSentenceEvaluation(value: unknown, model = SENTENCE_EVALUATION_MODEL): SentenceEvaluation | null {
  let candidate = value;
  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    } catch {
      return null;
    }
  }
  if (!candidate || typeof candidate !== "object") return null;

  const result = candidate as Record<string, unknown>;
  if (typeof result.score !== "number"
    || !Number.isFinite(result.score)
    || typeof result.correctedSentence !== "string"
    || typeof result.feedback !== "string"
    || typeof result.translation !== "string"
    || typeof result.targetWordUsed !== "boolean") return null;

  const correctedSentence = result.correctedSentence.trim().slice(0, 500);
  const feedback = result.feedback.trim().slice(0, 800);
  const translation = result.translation.trim().slice(0, 500);
  const flatPoint = parseFlatLearningPoint(result);
  const learningPoints = parseLearningPoints(result.learningPoints) ?? (flatPoint ? [flatPoint] : null);
  const sentenceStructure = cleanText(result.sentenceStructure, 300) || flatPoint?.pattern || "";
  const structureExplanation = cleanText(result.structureExplanation, 500) || flatPoint?.explanation || "";
  if (correctedSentence.length < 8
    || feedback.length < 20
    || translation.length < 2
    || sentenceStructure.length < 2
    || structureExplanation.length < 5
    || !learningPoints) return null;

  const requestedVerdict = VERDICTS.has(result.verdict as SentenceVerdict)
    ? result.verdict as SentenceVerdict
    : result.score >= 9 ? "correct" : result.score >= 7 ? "correct_with_feedback" : "incorrect";
  const verdict = result.targetWordUsed ? requestedVerdict : "incorrect";
  const [minimumScore, maximumScore] = verdict === "correct" ? [9, 10]
    : verdict === "correct_with_feedback" ? [7, 8]
      : [1, 6];

  return {
    verdict,
    score: Math.min(maximumScore, Math.max(minimumScore, Math.round(result.score))),
    correctedSentence,
    feedback,
    translation,
    sentenceStructure,
    structureExplanation,
    learningPoints,
    targetWordUsed: result.targetWordUsed,
    model,
  };
}

function parseFlatLearningPoint(value: Record<string, unknown>): SentenceLearningPoint | null {
  const phrase = cleanText(value.patternPhrase, 120);
  const pattern = cleanText(value.sentencePattern, 160);
  const meaning = cleanText(value.patternMeaning, 160);
  const explanation = cleanText(value.patternExplanation, 300);
  const example = cleanText(value.patternExample, 240);
  return phrase && pattern && meaning && explanation.length >= 5 && example.length >= 5
    ? { phrase, pattern, meaning, explanation, example }
    : null;
}

function parseLearningPoints(value: unknown): SentenceLearningPoint[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) return null;

  const points: SentenceLearningPoint[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const point = item as Record<string, unknown>;
    const phrase = cleanText(point.phrase, 120);
    const pattern = cleanText(point.pattern, 120);
    const meaning = cleanText(point.meaning, 160);
    const explanation = cleanText(point.explanation, 300);
    const example = cleanText(point.example, 240);
    if (!phrase || pattern.length < 2 || !meaning || explanation.length < 5 || example.length < 5) return null;
    points.push({ phrase, pattern, meaning, explanation, example });
  }
  return points;
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
