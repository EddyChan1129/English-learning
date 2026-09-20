import type { Stage } from "@/types";

export const STAGES: Stage[] = [0, 1, 2, 3];

export const STAGE_META: Record<Stage, { image: string }> = {
  0: { image: "/stage0-3d.png" },
  1: { image: "/stage1-3d.png" },
  2: { image: "/stage2-3d.png" },
  3: { image: "/stage3-3d.png" },
};
