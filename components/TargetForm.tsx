"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
      <p className="eyebrow">{t("target.eyebrow")}</p>
      <h2 className="font-display mt-2 text-3xl font-semibold">{t("target.title")}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{t("target.description")}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">
          {t("target.totalWords")}
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
          {t("target.totalDays")}
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
      <button className="btn-primary mt-6" disabled={busy}>{busy ? t("common.saving") : initial ? t("target.update") : t("target.start")}</button>
    </form>
  );
}
