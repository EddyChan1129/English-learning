import Image from "next/image";
import { useTranslation } from "react-i18next";
import { STAGE_META } from "@/lib/stages";
import type { Stage } from "@/types";

export function StageMascot({ stage, size = 64, className = "" }: { stage: Stage; size?: number; className?: string }) {
  const { t } = useTranslation();
  const meta = STAGE_META[stage];
  return (
    <Image
      src={meta.image}
      alt={t(`stages.${stage}.alt`)}
      width={size}
      height={size}
      sizes={`${size}px`}
      className={`stage-mascot ${stage === 3 ? "phoenix" : ""} ${className}`}
    />
  );
}
