import assert from "node:assert/strict";
import test from "node:test";
import { filterLearningPlanEntries } from "./learning-plans.ts";
import type { LearningPlanEntry } from "../types/index.ts";

const entries = [
  { term: "ability", partsOfSpeech: ["noun"], englishDefinition: "Skill", chineseMeanings: ["能力"], synonyms: ["capacity"] },
  { term: "avoid", partsOfSpeech: ["verb"], englishDefinition: "Keep away", chineseMeanings: ["避免"], synonyms: ["prevent"] },
  { term: "basic", partsOfSpeech: ["adjective"], englishDefinition: "Simple", chineseMeanings: ["基本"], synonyms: ["simple"] },
].map((entry, index) => ({ ...entry, id: String(index + 1), order: index + 1, examples: [], searchTokens: [] })) as LearningPlanEntry[];

test("filters and sorts learning-plan entries by study state", () => {
  const savedKeys = new Set(["ability", "avoid"]);
  const dueKeys = new Set(["avoid"]);
  const base = { query: "", part: "all" as const, saved: "all" as const, dueOnly: false, savedKeys, dueKeys };

  assert.deepEqual(filterLearningPlanEntries(entries, { ...base, order: "za" }).map((entry) => entry.term), ["basic", "avoid", "ability"]);
  assert.deepEqual(filterLearningPlanEntries(entries, { ...base, order: "az", part: "verb", dueOnly: true }).map((entry) => entry.term), ["avoid"]);
  assert.deepEqual(filterLearningPlanEntries(entries, { ...base, order: "az", saved: "unsaved" }).map((entry) => entry.term), ["basic"]);
});
