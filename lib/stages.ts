import type { Stage } from "@/types";

export const STAGES: Stage[] = [0, 1, 2, 3];

export const STAGE_META: Record<Stage, { image: string }> = {
  0: { image: "/stage0.png" },
  1: { image: "/stage1.png" },
  2: { image: "/stage2.png" },
  3: { image: "/stage3.png" },
};
