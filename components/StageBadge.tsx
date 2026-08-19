"use client";

import { useTranslation } from "react-i18next";
import type { Stage, WordDocument } from "@/types";

export function StageBadge({ stage, status, large = false }: { stage: Stage; status: WordDocument["status"]; large?: boolean }) {
  const { t } = useTranslation();
  return (
    <span className={`stage-badge ${status === "mastered" ? "mastered" : ""} ${large ? "large" : ""}`}>
      <span className="stage-dots" aria-hidden="true">{[1, 2, 3].map((pass) => <i key={pass} className={pass <= stage ? "filled" : ""} />)}</span>
      {status === "mastered" ? t("common.mastered") : t("common.stage", { stage })}
    </span>
  );
}
