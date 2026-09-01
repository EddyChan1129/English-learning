import type { SentenceEvaluation, SentenceVerdict } from "@/types";

const VERDICTS = new Set<SentenceVerdict>(["correct", "correct_with_feedback", "incorrect"]);

export const SENTENCE_EVALUATION_MODEL = "@cf/google/gemma-4-26b-a4b-it";

export const SENTENCE_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: [...VERDICTS] },
    correctedSentence: { type: "string" },
    feedback: { type: "string" },
    targetWordUsed: { type: "boolean" },
  },
  required: ["verdict", "correctedSentence", "feedback", "targetWordUsed"],
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
  if (!VERDICTS.has(result.verdict as SentenceVerdict)
    || typeof result.correctedSentence !== "string"
    || typeof result.feedback !== "string"
    || typeof result.targetWordUsed !== "boolean") return null;

  const correctedSentence = result.correctedSentence.trim().slice(0, 500);
  const feedback = result.feedback.trim().slice(0, 800);
  if (!correctedSentence || !feedback) return null;

  return {
    verdict: result.targetWordUsed ? result.verdict as SentenceVerdict : "incorrect",
    correctedSentence,
    feedback,
    targetWordUsed: result.targetWordUsed,
    model,
  };
}
