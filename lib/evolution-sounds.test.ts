import test from "node:test";
import assert from "node:assert/strict";
import { getEvolutionSoundCue, getEvolutionSoundVolume } from "./evolution-sounds.ts";

test("maps each successful evolution stage to its sound", () => {
  assert.equal(getEvolutionSoundCue(0), null);
  assert.equal(getEvolutionSoundCue(1), "/1.mp3");
  assert.equal(getEvolutionSoundCue(2), "/2.mp3");
  assert.equal(getEvolutionSoundCue(3), "/3.mp3");
});

test("sets playback levels for the generated chime and evolution sounds", () => {
  assert.equal(getEvolutionSoundVolume(1), .5);
  assert.equal(getEvolutionSoundVolume(2), .35);
  assert.equal(getEvolutionSoundVolume(3), .35);
});

test("starts audio during the gesture and reports failures unless stopped", async () => {
  const { playEvolutionSound } = await import("./evolution-sounds.ts");
  const originalAudio = globalThis.Audio;
  let started = false;
  let paused = false;
  let failures = 0;
  class FakeAudio {
    volume = 1;
    currentTime = 1;
    constructor(src: string) {
      assert.equal(src, "/1.mp3");
    }
    play() {
      started = true;
      return Promise.reject(new Error("Playback blocked"));
    }
    pause() { paused = true; }
  }
  globalThis.Audio = FakeAudio as unknown as typeof Audio;
  try {
    playEvolutionSound(1, () => failures++);
    assert.equal(started, true);
    await Promise.resolve();
    assert.equal(failures, 1);
    const stop = playEvolutionSound(1, () => failures++);
    stop();
    await Promise.resolve();
    assert.equal(paused, true);
    assert.equal(failures, 1);
  } finally {
    if (originalAudio) globalThis.Audio = originalAudio;
    else Reflect.deleteProperty(globalThis, "Audio");
  }
});
