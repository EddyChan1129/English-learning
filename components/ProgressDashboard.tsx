import Link from "next/link";
import { daysElapsed, toLocalDate } from "@/lib/date";
import type { UserTarget, WordDocument } from "@/types";

export function ProgressDashboard({ target, words }: { target: UserTarget; words: WordDocument[] }) {
  const today = toLocalDate();
  const mastered = words.filter((word) => word.status === "mastered").length;
  const due = words.filter((word) => word.status === "learning" && word.nextTestDate <= today).length;
  const day = Math.min(daysElapsed(target.startDate, today), target.targetDays);
  const wordProgress = percentage(mastered, target.targetWords);
  const timeProgress = percentage(day, target.targetDays);

  return (
    <section className="progress-layout">
      <div className="progress-sheet">
        <p className="eyebrow">Learning target</p>
        <p className="progress-number mt-5">
          {Math.max(0, target.targetWords - mastered).toLocaleString()}
          <small> / {target.targetWords.toLocaleString()} words remaining</small>
        </p>
        <div className="progress-rows">
          <ProgressRow
            label="Words mastered"
            value={`${mastered} · ${Math.round(wordProgress)}%`}
            progress={wordProgress}
          />
          <ProgressRow label="Time elapsed" value={`Day ${day} / ${target.targetDays}`} progress={timeProgress} />
        </div>
      </div>

      <Link href="/test" className="due-sheet no-underline">
        <p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-white/70">Due today</p>
        <div>
          <strong className="font-display block text-7xl font-semibold leading-none">{due}</strong>
          <p className="mt-2 text-sm text-white/75">{due ? "Start a short review →" : "Everything is up to date."}</p>
        </div>
      </Link>
    </section>
  );
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
