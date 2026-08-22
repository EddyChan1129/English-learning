import type { Stage } from "@/types";

export const STAGES: Stage[] = [0, 1, 2, 3];

export const STAGE_META: Record<Stage, { image: string; name: string }> = {
  0: { image: "/stage0.png", name: "Egg" },
  1: { image: "/stage1.png", name: "Hatching" },
  2: { image: "/stage2.png", name: "Mountain Chicken" },
  3: { image: "/stage3.png", name: "Phoenix" },
};
