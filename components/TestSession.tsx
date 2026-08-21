"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { isWordAnswerCorrect, makeGapSentence } from "@/lib/test-helpers";
import type { WordDocument } from "@/types";

type TestSessionProps = {
  words: WordDocument[];
  mode: "formal" | "random";
  onResult: (word: WordDocument, passed: boolean) => void | Promise<void>;
};

export function TestSession({ words, mode, onResult }: TestSessionProps) {
  const current = words[0];
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  const gapSentence = useMemo(() => {
    if (!current) return "";
    const source = current.sentences.find((sentence) =>
      sentence.toLowerCase().includes(current.word.toLowerCase()),
    ) ?? current.sentences[0];
    return makeGapSentence(source, current.word);
  }, [current]);

  function check() {
    if (!current) return;
    setOutcome(isWordAnswerCorrect(answer, current.word));
  }

  async function continueTest() {
    if (!current || outcome === null) return;
    setBusy(true);
    try {
      await onResult(current, outcome);
    } finally {
      setBusy(false);
    }
  }

  if (!current) {
    return (
      <section className="card p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center border border-[var(--green)] bg-[var(--mint)] text-3xl text-[var(--green)]">✓</div>
        <h2 className="font-display mt-4 text-3xl font-semibold">{t(mode === "formal" ? "test.completeTitle" : "test.randomCompleteTitle")}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{t(mode === "formal" ? "test.completeDescription" : "test.randomCompleteDescription")}</p>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[#f1effb] px-6 py-4">
        <div>
          <span className="eyebrow">{t(mode === "formal" ? "test.review" : "test.randomReview")}</span>
          <span className="ml-3 text-xs text-[var(--muted)]">{t("test.remaining", { count: words.length })}</span>
        </div>
        <span className="stage-badge">{t(mode === "formal" ? "test.gapFill" : "test.noStage")}</span>
      </div>
      <div className="p-6 sm:p-9">
        <p className="text-sm font-bold text-[var(--muted)]">{t("test.gapPrompt")}</p>
        <blockquote className="font-display mt-4 text-2xl font-medium leading-relaxed sm:text-3xl">“{gapSentence}”</blockquote>
        <p className="mt-3 text-sm text-[var(--muted)]">{t("test.hint", { meaning: current.chineseMeanings.join("；") })}</p>

        <form className="mt-7 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => {
          event.preventDefault();
          check();
        }}>
          <input
            className="field flex-1"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={outcome !== null}
            autoFocus
            placeholder={t("test.answerPlaceholder")}
            required
          />
          <button className="btn-primary" disabled={outcome !== null}>{t("test.check")}</button>
        </form>

        {outcome !== null ? (
          <div className={`mt-6 border p-4 ${outcome ? "border-[#8ed5b9] bg-[#effaf5] text-[var(--green)]" : "border-red-200 bg-red-50 text-red-700"}`} role="status">
            <strong>{outcome ? t("test.correct") : t("test.incorrect", { word: current.word })}</strong>
            <button className="btn-primary mt-3 block" onClick={continueTest} disabled={busy}>{busy ? t("common.saving") : t("test.continue")}</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
