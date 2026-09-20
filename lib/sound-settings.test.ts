import test from "node:test";
import assert from "node:assert/strict";
import { isMuted, MUTE_STORAGE_KEY, setMuted } from "./sound-settings.ts";
import { playEvolutionSound } from "./evolution-sounds.ts";

test("mute persists, stops active sounds, blocks new playback, and can be turned off", () => {
  const originalWindow = globalThis.window;
  const originalAudio = globalThis.Audio;
  const storage = new Map<string, string>();
  let played = 0;
  let paused = 0;
  let cancelled = 0;
  const fakeWindow = Object.assign(new EventTarget(), {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    },
    speechSynthesis: { cancel: () => { cancelled++; } },
  });
  globalThis.window = fakeWindow as unknown as Window & typeof globalThis;
  globalThis.Audio = class {
    volume = 1;
    currentTime = 0;
    play() { played++; return Promise.resolve(); }
    pause() { paused++; }
  } as unknown as typeof Audio;
  try {
    assert.equal(isMuted(), false);
    playEvolutionSound(1);
    assert.equal(played, 1);
    setMuted(true);
    assert.equal(storage.get(MUTE_STORAGE_KEY), "true");
    assert.equal(isMuted(), true);
    assert.equal(paused, 1);
    assert.ok(cancelled > 0);
    playEvolutionSound(2);
    assert.equal(played, 1);
    setMuted(false);
    const stop = playEvolutionSound(3);
    assert.equal(played, 2);
    stop();
    storage.set(MUTE_STORAGE_KEY, "true");
    assert.equal(isMuted(), true);
    fakeWindow.localStorage.setItem = () => { throw new Error("Storage blocked"); };
    fakeWindow.localStorage.getItem = () => { throw new Error("Storage blocked"); };
    setMuted(true);
    assert.equal(isMuted(), true);
    setMuted(false);
    assert.equal(isMuted(), false);
  } finally {
    if (originalWindow) globalThis.window = originalWindow;
    else Reflect.deleteProperty(globalThis, "window");
    if (originalAudio) globalThis.Audio = originalAudio;
    else Reflect.deleteProperty(globalThis, "Audio");
  }
});
