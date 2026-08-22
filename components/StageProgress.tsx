"use client";

import { useTranslation } from "react-i18next";
import { STAGES } from "@/lib/stages";
import type { Stage } from "@/types";
import { StageMascot } from "./StageMascot";

export function StageProgress({ currentStage, counts }: {
  currentStage?: Stage;
  counts?: Partial<Record<Stage, number>>;
}) {
  const { t } = useTranslation();
  return (
    <section className="stage-journey" aria-label={t("stageProgress.label")}>
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
            <div className={`stage-journey-step ${state}`} key={stage}>
              <div className="stage-journey-image">
                <StageMascot stage={stage} size={112} />
                {state === "complete" ? <span className="stage-check" aria-label={t("stageProgress.complete")}>✓</span> : null}
              </div>
              <strong>{t("common.stageName", { stage, label: t(`stages.${stage}.label`) })}</strong>
              <small>{counts
                ? t("stageProgress.wordCount", { count: counts[stage] ?? 0 })
                : t(`stageProgress.${state}`)}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
