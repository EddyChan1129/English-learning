"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { daysElapsed, isDue, toLocalDate } from "@/lib/date";
import { getLearningTargetProgress } from "@/lib/learning-target";
import type { UserTarget, WordDocument } from "@/types";

export function ProgressDashboard({ target, words }: { target: UserTarget; words: WordDocument[] }) {
  const { t } = useTranslation();
  const today = toLocalDate();
  const { mastered } = getLearningTargetProgress(target, words, today);
  const due = words.filter((word) => word.status === "learning" && isDue(word.nextTestDate)).length;
  const day = Math.min(daysElapsed(target.startDate, today), target.targetDays);
  const wordProgress = percentage(mastered, target.targetWords);
  const timeProgress = percentage(day, target.targetDays);

  return (
    <>
      <section className="progress-layout">
        <div className="progress-sheet">
          <div className="progress-target-summary">
            <p className="eyebrow">{t("progress.target")}</p>
            <p className="progress-number">
              {Math.max(0, target.targetWords - mastered).toLocaleString()}
              <small>{t("progress.remaining", { total: target.targetWords.toLocaleString() })}</small>
            </p>
          </div>
          <div className="progress-rows">
            <ProgressRow
              label={t("progress.wordsMastered")}
              value={`${mastered} · ${Math.round(wordProgress)}%`}
              progress={wordProgress}
            />
            <ProgressRow label={t("progress.timeElapsed")} value={t("progress.day", { day, total: target.targetDays })} progress={timeProgress} />
          </div>
        </div>

        <Link href="/test" className="due-sheet no-underline">
          <p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-white/70">{t("progress.dueToday")}</p>
          <div>
            <strong className="font-display block text-7xl font-semibold leading-none">{due}</strong>
            {due ? (
              <span className="due-review-cta">{t("progress.start")}<b aria-hidden="true">→</b></span>
            ) : (
              <p className="mt-2 text-sm text-white/75">{t("progress.upToDate")}</p>
            )}
          </div>
        </Link>
      </section>

      <section className="mobile-progress-summary" aria-label={t("progress.summary")}>
        <div className="mobile-summary-heading">
          <p className="eyebrow">{t("progress.target")}</p>
        </div>
        <div className="mobile-metrics">
          <Metric label={t("progress.wordsMastered")} value={`${mastered} / ${target.targetWords}`} />
          <Metric label={t("progress.timeElapsed")} value={`${day} / ${target.targetDays}`} />
          <Metric label={t("progress.dueToday")} value={String(due)} accent={due > 0} />
        </div>
        <div className="mobile-progress-bars">
          <div className="progress-bar" role="progressbar" aria-label={t("progress.wordsMastered")} aria-valuenow={Math.round(wordProgress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${wordProgress}%` }} /></div>
          <div className="progress-bar time" role="progressbar" aria-label={t("progress.timeElapsed")} aria-valuenow={Math.round(timeProgress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${timeProgress}%` }} /></div>
        </div>
        {due ? <Link href="/test" className="mobile-review-link">{t("progress.start")} <span aria-hidden="true">→</span></Link> : <p className="mobile-up-to-date"><span aria-hidden="true">✓</span>{t("progress.upToDate")}</p>}
      </section>
    </>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className={accent ? "accent" : ""}><span>{label}</span><strong>{value}</strong></div>;
}

function ProgressRow({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <div className="progress-row">
      <strong>{label}</strong>
      <div
        className="progress-bar"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <span className="font-mono text-[11px] text-[var(--muted)]">{value}</span>
    </div>
  );
}

function percentage(value: number, total: number) {
  return Math.min(100, (value / total) * 100);
}
