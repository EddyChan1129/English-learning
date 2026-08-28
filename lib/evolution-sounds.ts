import type { Stage } from "@/types";

export type EvolutionSoundCue = "/1.wav" | "/2.mp3" | "/3.mp3";

export function getEvolutionSoundCue(stage: Stage): EvolutionSoundCue | null {
  if (stage === 1) return "/1.wav";
  if (stage === 2) return "/2.mp3";
  if (stage === 3) return "/3.mp3";
  return null;
}

export function getEvolutionSoundVolume(stage: Stage) {
  return stage === 1 ? .11 : .35;
}

export function playEvolutionSound(stage: Stage) {
  const cue = getEvolutionSoundCue(stage);
  if (!cue || typeof Audio === "undefined") return () => undefined;

  const audio = new Audio(cue);
  audio.volume = getEvolutionSoundVolume(stage);
  void audio.play().catch(() => undefined);

  return () => {
    audio.pause();
    audio.currentTime = 0;
  };
}
