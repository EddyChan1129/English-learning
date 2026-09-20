import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_LANGUAGE_PREFERENCES, normalizeLanguagePreferences } from "./languages.ts";

test("normalizes saved learning and explanation languages", () => {
  assert.deepEqual(normalizeLanguagePreferences({ learningLanguage: "fr-FR", explanationLanguage: "en-US" }), {
    learningLanguage: "fr-FR",
    explanationLanguage: "en-US",
  });
  assert.deepEqual(normalizeLanguagePreferences({ learningLanguage: "invalid" }), DEFAULT_LANGUAGE_PREFERENCES);
});
