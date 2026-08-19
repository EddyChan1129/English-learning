"use client";

import Link from "next/link";
import { TestSession } from "@/components/TestSession";
import { useApp } from "@/components/AppProvider";

export default function TestPage() {
  const { dueWords, wordsLoaded, saveTestResult } = useApp();

  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <header className="mb-7 border-b border-[var(--line)] pb-5">
        <p className="eyebrow">Daily review</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title">Test what you remember.</h1>
            <p className="mt-2 text-[var(--muted)]">One word at a time. Your test type is chosen at random.</p>
          </div>
          <span className="count-label">{dueWords.length} due today</span>
        </div>
      </header>

      {!wordsLoaded
        ? <p className="py-24 text-center text-sm text-[var(--muted)]">Preparing today’s words…</p>
        : <TestSession key={dueWords[0]?.id ?? "empty"} words={dueWords} onResult={saveTestResult} />}

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Want to look over a word first? <Link href="/history" className="text-button">Open history</Link>
      </p>
    </div>
  );
}
