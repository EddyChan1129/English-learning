"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { Stage, WordDocument } from "@/types";
import { StageMascot } from "./StageMascot";

export function StageBadge({ stage, status, large = false }: { stage: Stage; status: WordDocument["status"]; large?: boolean }) {
  const { t } = useTranslation();
  const statusLabel = status === "inactive"
    ? t("common.inactive")
    : status === "mastered" ? t("common.mastered") : "";
  return (
    <Badge className={`stage-badge ${status} ${large ? "large" : ""}`}>
      <StageMascot stage={stage} size={large ? 52 : 34} />
      <span>
        <strong>{t("common.stageName", { stage, label: t(`stages.${stage}.label`) })}</strong>
        {statusLabel ? <small>{statusLabel}</small> : null}
      </span>
    </Badge>
  );
}
