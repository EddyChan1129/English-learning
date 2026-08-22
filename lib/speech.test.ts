import test from "node:test";
import assert from "node:assert/strict";
import { chooseSpeechVoice, hasPreferredSpeechVoice } from "./speech.ts";

test("prefers Google US English over other en-US voices", () => {
  const voices = [
    { name: "Novelty Voice", lang: "en-US" },
    { name: "Google US English", lang: "en-US" },
    { name: "Samantha", lang: "en_US" },
  ];
  assert.equal(chooseSpeechVoice(voices, "en-US")?.name, "Google US English");
  assert.equal(chooseSpeechVoice(voices.slice(0, 1), "en-US")?.name, "Novelty Voice");
  assert.equal(hasPreferredSpeechVoice(voices, "en-US"), true);
  assert.equal(hasPreferredSpeechVoice(voices.slice(0, 1), "en-US"), false);
});
