"use client";

import { useState } from "react";
import { toLocalDate } from "@/lib/date";
import type { UserTarget } from "@/types";

type TargetFormProps = {
  initial?: UserTarget | null;
  onSave: (target: UserTarget) => Promise<void>;
};

export function TargetForm({ initial, onSave }: TargetFormProps) {
  const [targetWords, setTargetWords] = useState(initial?.targetWords ?? 1000);
  const [targetDays, setTargetDays] = useState(initial?.targetDays ?? 100);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await onSave({ targetWords, targetDays, startDate: initial?.startDate ?? toLocalDate() });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <p className="eyebrow">Your destination</p>
      <h2 className="font-display mt-2 text-3xl font-semibold">Set a learning target</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">Choose something ambitious enough to matter and realistic enough to finish.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">
          Total words
          <input
            className="field mt-2"
            type="number"
            min="1"
            max="100000"
            value={targetWords}
            onChange={(event) => setTargetWords(event.target.valueAsNumber)}
            required
          />
        </label>
        <label className="text-sm font-bold">
          Total days
          <input
            className="field mt-2"
            type="number"
            min="1"
            max="3650"
            value={targetDays}
            onChange={(event) => setTargetDays(event.target.valueAsNumber)}
            required
          />
        </label>
      </div>
      <button className="btn-primary mt-6" disabled={busy}>{busy ? "Saving…" : initial ? "Update target" : "Start learning"}</button>
    </form>
  );
}
