import test from "node:test";
import assert from "node:assert/strict";
import { getEvolutionSoundCue, getEvolutionSoundVolume } from "./evolution-sounds.ts";

test("maps each successful evolution stage to its sound", () => {
  assert.equal(getEvolutionSoundCue(0), null);
  assert.equal(getEvolutionSoundCue(1), "/1.wav");
  assert.equal(getEvolutionSoundCue(2), "/2.mp3");
  assert.equal(getEvolutionSoundCue(3), "/3.mp3");
});

test("balances the louder first evolution sound", () => {
  assert.equal(getEvolutionSoundVolume(1), .11);
  assert.equal(getEvolutionSoundVolume(2), .35);
  assert.equal(getEvolutionSoundVolume(3), .35);
});
