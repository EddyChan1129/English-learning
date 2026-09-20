"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { STAGES } from "@/lib/stages";
import type { Stage } from "@/types";
import { StageMascot } from "./StageMascot";

export function StageProgress({ currentStage, counts }: {
  currentStage?: Stage;
  counts?: Partial<Record<Stage, number>>;
}) {
  const { t } = useTranslation();
  return (
    <Card className="stage-journey" role="group" aria-label={t("stageProgress.label")}>
      <div className="stage-journey-track">
        {STAGES.map((stage) => {
          const state = currentStage === undefined
            ? "overview"
            : stage < currentStage
              ? "complete"
              : stage === currentStage
                ? "current"
                : "future";
          return (
            <div
              className={`stage-journey-step ${state}`}
              key={stage}
              aria-current={state === "current" ? "step" : undefined}
              aria-label={t("common.stageName", { stage, label: t(`stages.${stage}.label`) })}
            >
              <div className="stage-journey-image">
                <span className="stage-journey-clip">
                  <StageMascot stage={stage} size={56} />
                </span>
                {state === "complete" ? <span className="stage-check" aria-label={t("stageProgress.complete")}>✓</span> : null}
              </div>
              <div className="stage-journey-copy">
                <strong className="stage-name-full">{t("common.stageName", { stage, label: t(`stages.${stage}.label`) })}</strong>
                <strong className="stage-name-compact">{stage} · {t(`stageProgress.shortLabels.${stage}`)}</strong>
                {counts ? (
                  <Badge className="stage-count">{counts[stage] ?? 0}</Badge>
                ) : (
                  <small>{t(`stageProgress.${state}`)}</small>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
