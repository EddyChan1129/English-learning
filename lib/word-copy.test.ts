import assert from "node:assert/strict";
import test from "node:test";
import { makeCopiedWord } from "./word-copy.ts";
import type { WordDocument } from "../types/index.ts";

test("copies a friend word at stage zero and makes it due today", () => {
  const source: WordDocument = {
    id: "source-word",
    word: "demonstrate",
    chineseMeaning: "示範；展示",
    synonyms: ["show"],
    sentences: ["Let me demonstrate the idea.", "The results demonstrate a clear pattern."],
    partsOfSpeech: ["verb"],
    commonPhrases: ["demonstrate that ...", "demonstrate how ..."],
    stage: 3,
    status: "mastered",
    nextTestDate: "2026-08-19",
    createdAt: "2026-08-01T00:00:00.000Z",
  };

  assert.deepEqual(makeCopiedWord(source, "friend-2", "2026-08-19", "2026-08-19T10:00:00.000Z"), {
    word: "demonstrate",
    chineseMeaning: "示範；展示",
    synonyms: ["show"],
    sentences: ["Let me demonstrate the idea.", "The results demonstrate a clear pattern."],
    partsOfSpeech: ["verb"],
    commonPhrases: ["demonstrate that ...", "demonstrate how ..."],
    stage: 0,
    status: "learning",
    nextTestDate: "2026-08-19",
    createdAt: "2026-08-19T10:00:00.000Z",
    copiedFrom: { userId: "friend-2", wordId: "source-word" },
  });
});
