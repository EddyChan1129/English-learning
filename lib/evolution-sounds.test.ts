import test from "node:test";
import assert from "node:assert/strict";
import { getEvolutionSoundCue } from "./evolution-sounds.ts";

test("maps each successful evolution stage to its sound", () => {
  assert.equal(getEvolutionSoundCue(0), null);
  assert.equal(getEvolutionSoundCue(1), "hatch");
  assert.equal(getEvolutionSoundCue(2), "chicken");
  assert.equal(getEvolutionSoundCue(3), "phoenix");
});
