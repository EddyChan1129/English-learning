import { isMuted, subscribeToMute } from "./sound-settings.ts";
import type { Stage } from "@/types";

export type EvolutionSoundCue = "/1.mp3" | "/2.mp3" | "/3.mp3";

export function getEvolutionSoundCue(stage: Stage): EvolutionSoundCue | null {
  if (stage === 1) return "/1.mp3";
  if (stage === 2) return "/2.mp3";
  if (stage === 3) return "/3.mp3";
  return null;
}

export function getEvolutionSoundVolume(stage: Stage) {
  return stage === 1 ? .5 : .35;
}

export function playEvolutionSound(stage: Stage, onError?: () => void) {
  const cue = getEvolutionSoundCue(stage);
  if (isMuted() || !cue || typeof Audio === "undefined") return () => undefined;

  const audio = new Audio(cue);
  audio.volume = getEvolutionSoundVolume(stage);
  let stopped = false;
  const unsubscribe = typeof window === "undefined" ? () => undefined : subscribeToMute(() => {
    if (isMuted()) stop();
  });
  function stop() {
    stopped = true;
    audio.pause();
    audio.currentTime = 0;
    unsubscribe();
  }
  audio.onended = unsubscribe;
  // Keep play synchronous with the answer click for mobile autoplay policies.
  void audio.play().catch(() => {
    unsubscribe();
    if (!stopped) onError?.();
  });

  return stop;
}
