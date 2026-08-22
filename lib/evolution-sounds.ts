import type { Stage } from "@/types";

export type EvolutionSoundCue = "hatch" | "chicken" | "phoenix";

let audioContext: AudioContext | null = null;

export function getEvolutionSoundCue(stage: Stage): EvolutionSoundCue | null {
  if (stage === 1) return "hatch";
  if (stage === 2) return "chicken";
  if (stage === 3) return "phoenix";
  return null;
}

export function playEvolutionSound(stage: Stage) {
  const cue = getEvolutionSoundCue(stage);
  if (!cue || typeof window === "undefined" || !window.AudioContext) return () => undefined;

  audioContext ??= new window.AudioContext();
  const context = audioContext;
  void context.resume();

  const master = context.createGain();
  master.gain.value = .2;
  master.connect(context.destination);
  const start = context.currentTime + .015;

  if (cue === "hatch") playHatch(context, master, start);
  if (cue === "chicken") playChicken(context, master, start);
  if (cue === "phoenix") playPhoenix(context, master, start);

  return () => {
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + .03);
  };
}

function playHatch(context: AudioContext, output: AudioNode, start: number) {
  [0, .1, .24].forEach((offset, index) => {
    noiseBurst(context, output, start + offset, .055 + index * .01, 1700 + index * 650, .7);
  });
  tone(context, output, start + .22, .2, 190, 85, .22, "triangle");
}

function playChicken(context: AudioContext, output: AudioNode, start: number) {
  const calls = [
    [0, .1, 620, 430],
    [.13, .11, 700, 470],
    [.29, .17, 820, 520],
    [.49, .12, 650, 390],
  ] as const;
  calls.forEach(([offset, duration, from, to], index) => {
    tone(context, output, start + offset, duration, from, to, index === 2 ? .34 : .25, "sawtooth");
  });
}

function playPhoenix(context: AudioContext, output: AudioNode, start: number) {
  noiseBurst(context, output, start, 1.15, 900, .42, 2600);
  tone(context, output, start, 1.05, 180, 720, .23, "sine");
  tone(context, output, start + .1, 1.1, 270, 1080, .16, "triangle");
  tone(context, output, start + .28, .95, 405, 1215, .11, "sine");
  tone(context, output, start + .76, .55, 720, 1440, .09, "sine");
}

function tone(
  context: AudioContext,
  output: AudioNode,
  start: number,
  duration: number,
  fromFrequency: number,
  toFrequency: number,
  volume: number,
  type: OscillatorType,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(fromFrequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(toFrequency, start + duration);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + Math.min(.025, duration / 4));
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(output);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function noiseBurst(
  context: AudioContext,
  output: AudioNode,
  start: number,
  duration: number,
  frequency: number,
  volume: number,
  endFrequency = frequency,
) {
  const frameCount = Math.ceil(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < frameCount; index += 1) channel[index] = Math.random() * 2 - 1;

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.Q.value = 1.1;
  filter.frequency.setValueAtTime(frequency, start);
  filter.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + Math.min(.012, duration / 4));
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  source.connect(filter).connect(gain).connect(output);
  source.start(start);
  source.stop(start + duration + .02);
}
