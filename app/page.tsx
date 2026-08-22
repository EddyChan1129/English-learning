"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddWordForm } from "@/components/AddWordForm";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { StageMascot } from "@/components/StageMascot";
import { StageProgress } from "@/components/StageProgress";
import { TargetForm } from "@/components/TargetForm";
import { useApp } from "@/components/AppProvider";
import type { Stage, WordDocument } from "@/types";

export default function HomePage() {
  const { target, targetLoaded, words, saveLearningTarget, createWord, dueWords } = useApp();
  const [editingTarget, setEditingTarget] = useState(false);
  const { t } = useTranslation();

  if (!targetLoaded) return <PageLoading />;

  if (!target || editingTarget) {
    return (
      <div className="mx-auto max-w-2xl pt-8">
        <TargetForm
          initial={target}
          onSave={async (nextTarget) => {
            await saveLearningTarget(nextTarget);
            setEditingTarget(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-rise">
      <header className="theme-hero">
        <div>
          <p className="eyebrow">{t("home.themeEyebrow")}</p>
          <h1>{t("home.themeTitle")}</h1>
          <strong>{t("home.themeLead")}</strong>
          <p>{t("home.themeDescription")}</p>
          <button className="text-button" onClick={() => setEditingTarget(true)}>{t("home.editTarget")}</button>
        </div>
        <StageMascot stage={3} size={260} className="theme-hero-mascot" />
      </header>

      <StageProgress counts={countStages(words)} />
      <ProgressDashboard target={target} words={words} onEditTarget={() => setEditingTarget(true)} />

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
        <AddWordForm onAdd={createWord} />
      </section>
    </div>
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
