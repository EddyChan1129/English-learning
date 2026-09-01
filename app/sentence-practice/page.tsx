"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SpeechButton } from "@/components/SpeechButton";
import { StageMascot } from "@/components/StageMascot";
import { useApp } from "@/components/AppProvider";
import { recordSentenceAttempt } from "@/lib/firestore";
import { parseSentenceEvaluation } from "@/lib/sentence-evaluation";
import type { SentenceEvaluation, WordDocument } from "@/types";

export default function SentencePracticePage() {
  const { user, words, wordsLoaded, languagePreferences } = useApp();
  const { t } = useTranslation();
  const eligibleWords = useMemo(
    () => words.filter((word) => word.stage === 3 && word.status !== "inactive"),
    [words],
  );
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [sentence, setSentence] = useState("");
  const [evaluation, setEvaluation] = useState<SentenceEvaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const current = eligibleWords.find((word) => word.id === currentId) ?? eligibleWords[0];

  async function checkSentence() {
    if (!current || !sentence.trim()) return;
    setBusy(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/sentence-evaluations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetWord: current.word,
          meanings: current.chineseMeanings,
          partsOfSpeech: current.partsOfSpeech,
          sentence: sentence.trim(),
          explanationLanguage: languagePreferences.explanationLanguage,
        }),
      });
      const payload: unknown = await response.json();
      const model = payload && typeof payload === "object" && typeof (payload as { model?: unknown }).model === "string"
        ? (payload as { model: string }).model
        : undefined;
      const result = response.ok ? parseSentenceEvaluation(payload, model) : null;
      if (!result) throw new Error("evaluation-failed");

      setEvaluation(result);
      try {
        await recordSentenceAttempt(user.uid, {
          ...result,
          wordId: current.id,
          targetWord: current.word,
          sentence: sentence.trim(),
        });
      } catch {
        setError(t("sentencePractice.saveWarning"));
      }
    } catch {
      setError(t("sentencePractice.error"));
    } finally {
      setBusy(false);
    }
  }

  function resetAttempt() {
    setEvaluation(null);
    setError("");
  }

  function nextWord() {
    if (!current) return;
    const index = eligibleWords.findIndex((word) => word.id === current.id);
    setCurrentId(eligibleWords[(index + 1) % eligibleWords.length]?.id ?? null);
    setSentence("");
    setEvaluation(null);
    setError("");
  }

  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <header className="mb-7 border-b border-[var(--line)] pb-5">
        <p className="eyebrow">{t("sentencePractice.eyebrow")}</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title">{t("sentencePractice.title")}</h1>
            <p className="mt-2 max-w-2xl text-[var(--muted)]">{t("sentencePractice.description")}</p>
          </div>
          <span className="count-label">{t("sentencePractice.eligibleCount", { count: eligibleWords.length })}</span>
        </div>
      </header>

      {!wordsLoaded ? (
        <p className="py-24 text-center text-sm text-[var(--muted)]">{t("sentencePractice.preparing")}</p>
      ) : current ? (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--line)] bg-[#fff8dd] px-6 py-4">
            <span className="eyebrow">{t("sentencePractice.phoenixOnly")}</span>
            <span className="stage-badge mastered">{t("common.stageName", { stage: 3, label: t("stages.3.label") })}</span>
          </div>

          <div className="grid gap-7 p-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:p-9">
            <aside className="flex flex-col items-center border-b border-[var(--line)] pb-5 text-center sm:border-r sm:border-b-0 sm:pr-6 sm:pb-0">
              <StageMascot stage={3} size={120} />
              <small className="mt-3 text-xs font-bold text-[var(--muted)]">{t("sentencePractice.ready")}</small>
            </aside>

            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--muted)]">{t("sentencePractice.useWord")}</p>
              <h2 className="font-display mt-2 break-words text-4xl font-semibold text-[var(--violet)]">{current.word}</h2>
              <WordHints word={current} />

              <form className="mt-7" onSubmit={(event) => {
                event.preventDefault();
                void checkSentence();
              }}>
                <label htmlFor="learner-sentence" className="text-sm font-bold">{t("sentencePractice.yourSentence")}</label>
                <textarea
                  id="learner-sentence"
                  className="field mt-2 min-h-32 resize-y text-base leading-7"
                  value={sentence}
                  onChange={(event) => setSentence(event.target.value.slice(0, 500))}
                  disabled={busy || evaluation !== null}
                  maxLength={500}
                  autoFocus
                  required
                  placeholder={t("sentencePractice.placeholder", { word: current.word })}
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <small className="text-[var(--muted)]">{t("sentencePractice.acceptanceHint")}</small>
                  {!evaluation ? (
                    <Button size="lg" disabled={busy || !sentence.trim()}>
                      {busy ? t("sentencePractice.checking") : t("sentencePractice.check")}
                    </Button>
                  ) : null}
                </div>
              </form>

              {error ? <p className="feedback error mt-4" role="alert">{error}</p> : null}
              {evaluation ? (
                <EvaluationResult
                  evaluation={evaluation}
                  onRetry={resetAttempt}
                  onNext={nextWord}
                />
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <section className="card p-8 text-center">
          <StageMascot stage={3} size={96} className="mx-auto" />
          <h2 className="font-display mt-4 text-3xl font-semibold">{t("sentencePractice.emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">{t("sentencePractice.emptyDescription")}</p>
        </section>
      )}
    </div>
  );
}

function WordHints({ word }: { word: WordDocument }) {
  const { t } = useTranslation();
  return (
    <dl className="mt-4 grid gap-2 border-l-4 border-[var(--highlight)] pl-4 text-sm">
      <div><dt className="inline font-bold">{t("sentencePractice.meaning")}: </dt><dd className="inline text-[var(--muted)]">{word.chineseMeanings.join(" · ")}</dd></div>
      {word.synonyms.length ? <div><dt className="inline font-bold">{t("sentencePractice.synonyms")}: </dt><dd className="inline text-[var(--muted)]">{word.synonyms.join(" · ")}</dd></div> : null}
    </dl>
  );
}

function EvaluationResult({ evaluation, onRetry, onNext }: {
  evaluation: SentenceEvaluation;
  onRetry: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const passed = evaluation.verdict !== "incorrect";
  return (
    <section className={`sentence-evaluation ${passed ? "passed" : "needs-work"}`} aria-live="polite">
      <p className="text-xs font-black uppercase tracking-wider">{t(`sentencePractice.verdict.${evaluation.verdict}`)}</p>
      <p className="mt-2 text-sm leading-6">{evaluation.feedback}</p>
      <div className="mt-4 border-t border-current/20 pt-4">
        <small className="font-bold">{t("sentencePractice.suggestedSentence")}</small>
        <p className="font-display mt-1 text-xl font-semibold">“{evaluation.correctedSentence}”</p>
        <SpeechButton text={evaluation.correctedSentence} language="en-US" label={t("sentencePractice.listen")} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {evaluation.verdict !== "correct" ? <Button type="button" variant="outline" onClick={onRetry}>{t("sentencePractice.tryAgain")}</Button> : null}
        <Button type="button" onClick={onNext}>{t("sentencePractice.nextWord")}</Button>
      </div>
    </section>
  );
}
