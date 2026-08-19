import { daysElapsed, toLocalDate } from "@/lib/date";
import type { UserTarget, WordDocument } from "@/types";

function ProgressBar({ value, color }: { value: number; color: string }) {
  return <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/8" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} /></div>;
}

export function ProgressDashboard({ target, words }: { target: UserTarget; words: WordDocument[] }) {
  const today = toLocalDate();
  const mastered = words.filter((word) => word.status === "mastered").length;
  const due = words.filter((word) => word.status === "learning" && word.nextTestDate <= today).length;
  const day = Math.min(daysElapsed(target.startDate, today), target.targetDays);
  const learningProgress = (mastered / target.targetWords) * 100;
  const timeProgress = (day / target.targetDays) * 100;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.35fr_.85fr]">
      <div className="card overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--orange)]">Your big goal</p>
            <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{Math.max(0, target.targetWords - mastered).toLocaleString()} <span className="text-2xl text-black/35">/ {target.targetWords.toLocaleString()}</span></h1>
            <p className="mt-1 text-sm text-black/55">words remaining · {mastered} mastered</p>
          </div>
          <div className="rounded-2xl bg-[var(--sage)] px-4 py-3 text-center"><strong className="block text-2xl">{Math.round(learningProgress)}%</strong><span className="text-xs font-bold uppercase tracking-wider">complete</span></div>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div><div className="flex justify-between text-sm"><strong>Target progress</strong><span>{mastered} words</span></div><ProgressBar value={learningProgress} color="bg-[var(--green)]" /></div>
          <div><div className="flex justify-between text-sm"><strong>Time progress</strong><span>Day {day} / {target.targetDays}</span></div><ProgressBar value={timeProgress} color="bg-[var(--orange)]" /></div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] bg-[var(--ink)] p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-8 -top-10 size-36 rounded-full border-[24px] border-white/5" />
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9d2b5]">Today’s due tests</p>
        <p className="font-display mt-3 text-7xl font-semibold">{due}</p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-white/65">{due ? "A short review now keeps these words from slipping away." : "You’re all caught up. Add a fresh word when you’re ready."}</p>
      </div>
    </section>
  );
}
