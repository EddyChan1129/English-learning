"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddWordForm } from "@/components/AddWordForm";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { Card } from "@/components/ui/card";
import { StageProgress } from "@/components/StageProgress";
import { TargetForm } from "@/components/TargetForm";
import { useApp } from "@/components/AppProvider";
import { getLearningTargetProgress } from "@/lib/learning-target";
import type { Stage, WordDocument } from "@/types";

export default function HomePage() {
  const { target, targetLoaded, words, wordsLoaded, vocabularyCategories, saveLearningTarget, createWord, dueWords } = useApp();
  const [expiredAction, setExpiredAction] = useState<"prompt" | "continue" | "new">("prompt");
  const { t } = useTranslation();

  if (!targetLoaded) return <PageLoading />;

  if (!target) {
    return (
      <div className="mx-auto max-w-2xl pt-8">
        <TargetForm onSave={saveLearningTarget} />
      </div>
    );
  }

  const totalMastered = words.filter((word) => word.status === "mastered").length;
  const { mastered: planProgress, complete, expired } = getLearningTargetProgress(target, words);
  const planComplete = wordsLoaded && complete;
  const planExpired = wordsLoaded && expired;
  const startNewPlan = (nextTarget: Parameters<typeof saveLearningTarget>[0]) => saveLearningTarget({
    ...nextTarget,
    startingMastered: totalMastered,
  });

  if (planComplete) {
    return (
      <PlanMilestone kind="complete" progress={planProgress} target={target.targetWords}>
        <TargetForm onSave={startNewPlan} />
      </PlanMilestone>
    );
  }

  if (planExpired && expiredAction !== "continue") {
    return (
      <PlanMilestone kind="expired" progress={planProgress} target={target.targetWords}>
        {expiredAction === "new" ? (
          <TargetForm onSave={startNewPlan} />
        ) : (
          <div className="plan-milestone-actions">
            <button className="btn-primary" onClick={() => setExpiredAction("continue")}>{t("planMilestone.keepGoing")}</button>
            <button className="btn-secondary" onClick={() => setExpiredAction("new")}>{t("planMilestone.startAnother")}</button>
          </div>
        )}
      </PlanMilestone>
    );
  }

  return (
    <div className="space-y-7 animate-rise">
      <Card className="theme-hero">
        <header className="theme-hero-copy">
          <div>
            <p className="eyebrow">{t("home.themeEyebrow")}</p>
            <h1>{t("home.themeTitle")}</h1>
            <p>{t("home.themeLead")}</p>
          </div>
        </header>
        <StageProgress counts={countStages(words)} />
      </Card>
      <ProgressDashboard target={target} words={words} />

      <section className="home-learning-workspace">
        <aside className="note-panel home-note-panel">
          <div>
            <span className="font-mono text-xs uppercase tracking-[.16em] text-[var(--violet)]">{t("home.note")}</span>
            <p className="font-display mt-2 text-2xl leading-tight">
              {dueWords.length
                ? t("home.due", { count: dueWords.length })
                : t("home.clear")}
            </p>
          </div>
          <p className="home-note-explainer text-sm leading-6 text-[var(--muted)]">
            {t("home.threePasses")}
          </p>
        </aside>
        <AddWordForm onAdd={createWord} categories={vocabularyCategories} />
      </section>
    </div>
  );
}

function PlanMilestone({ kind, progress, target, children }: {
  kind: "complete" | "expired";
  progress: number;
  target: number;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const complete = kind === "complete";
  return (
    <section className={`plan-milestone ${kind} animate-rise`}>
      <div className="plan-milestone-message">
        <StageProgress currentStage={complete ? 3 : 2} />
        <p className="eyebrow">{t(`planMilestone.${kind}.eyebrow`)}</p>
        <h1>{t(`planMilestone.${kind}.title`)}</h1>
        <p>{t(`planMilestone.${kind}.description`, { progress, target })}</p>
      </div>
      <div className="plan-milestone-next">
        <h2>{t(complete ? "planMilestone.nextTitle" : "planMilestone.chooseTitle")}</h2>
        {children}
      </div>
    </section>
  );
}

function countStages(words: WordDocument[]): Record<Stage, number> {
  const counts: Record<Stage, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const word of words) counts[word.stage] += 1;
  return counts;
}

function PageLoading() {
  const { t } = useTranslation();
  return <p className="py-24 text-center text-sm text-[var(--muted)]">{t("home.loading")}</p>;
}
