"use client";

import { useState } from "react";
import { AddWordForm } from "@/components/AddWordForm";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { TargetForm } from "@/components/TargetForm";
import { useApp } from "@/components/AppProvider";

export default function HomePage() {
  const { target, targetLoaded, words, saveLearningTarget, createWord, dueWords } = useApp();
  const [editingTarget, setEditingTarget] = useState(false);

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
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <p className="eyebrow">Your learning desk</p>
          <h1 className="page-title">Keep the words you learn.</h1>
          <p className="mt-2 text-[var(--muted)]">Review what is due, then add something worth remembering.</p>
        </div>
        <button className="text-button" onClick={() => setEditingTarget(true)}>Edit learning target</button>
      </header>

      <ProgressDashboard target={target} words={words} />

      <section className="grid items-start gap-6 xl:grid-cols-[.7fr_1.3fr]">
        <aside className="note-panel">
          <span className="font-mono text-xs uppercase tracking-[.16em] text-[var(--violet)]">Today’s note</span>
          <p className="font-display mt-4 text-3xl leading-tight">
            {dueWords.length
              ? `${dueWords.length} ${dueWords.length === 1 ? "word is" : "words are"} ready for another pass.`
              : "Your review list is clear."}
          </p>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            Each word needs three successful tests before it moves into your mastered collection.
          </p>
        </aside>
        <AddWordForm onAdd={createWord} />
      </section>
    </div>
  );
}

function PageLoading() {
  return <p className="py-24 text-center text-sm text-[var(--muted)]">Opening your learning desk…</p>;
}
