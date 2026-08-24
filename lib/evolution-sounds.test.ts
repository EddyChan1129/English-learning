import test from "node:test";
import assert from "node:assert/strict";
import { getEvolutionSoundCue } from "./evolution-sounds.ts";

test("maps each successful evolution stage to its sound", () => {
  assert.equal(getEvolutionSoundCue(0), null);
  assert.equal(getEvolutionSoundCue(1), "/1.wav");
  assert.equal(getEvolutionSoundCue(2), "/2.mp3");
  assert.equal(getEvolutionSoundCue(3), "/3.mp3");
});
