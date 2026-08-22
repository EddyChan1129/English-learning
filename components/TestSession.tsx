"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { StageMascot } from "@/components/StageMascot";
import { calculateTestUpdate } from "@/lib/spaced-repetition";
import { getSpellingHint, isWordAnswerCorrect, makeGapSentence } from "@/lib/test-helpers";
import type { Stage, WordDocument } from "@/types";

type TestSessionProps = {
  words: WordDocument[];
  mode: "formal" | "random";
  onResult: (word: WordDocument, passed: boolean, usedHint: boolean) => void | Promise<void>;
};

export function TestSession({ words, mode, onResult }: TestSessionProps) {
  const current = words[0];
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
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
      await onResult(current, outcome, hintVisible);
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

  const isStageOneTest = mode === "formal" && current.stage === 0;
  const resultStage = outcome === null || mode === "random"
    ? current.stage
    : calculateTestUpdate(current.stage, outcome, new Date(0).toISOString()).stage;

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
        <div className="test-question-layout">
          <aside className={`test-stage-identity stage-${current.stage}`}>
            <StageMascot stage={current.stage} size={150} />
            <strong>{t("common.stageName", { stage: current.stage, label: t(`stages.${current.stage}.label`) })}</strong>
            <small>{t(mode === "formal" ? "test.currentEvolution" : "test.practiceStage")}</small>
          </aside>
          <div>
            <p className="text-sm font-bold text-[var(--muted)]">{t("test.gapPrompt")}</p>
            <blockquote className="font-display mt-4 text-2xl font-medium leading-relaxed sm:text-3xl">“{gapSentence}”</blockquote>
            <p className="mt-3 text-sm text-[var(--muted)]">{t("test.hint", { meaning: current.chineseMeanings.join("；") })}</p>
            {isStageOneTest ? (
              <div className="mt-3">
                {hintVisible ? (
                  <p className="font-mono text-sm font-semibold tracking-wider text-[var(--violet)]" aria-live="polite">
                    {t("test.spellingHint", { hint: getSpellingHint(current.word) })}
                  </p>
                ) : (
                  <Button type="button" variant="secondary" size="sm" onClick={() => setHintVisible(true)}>
                    {t("test.showSpellingHint")}
                  </Button>
                )}
              </div>
            ) : null}

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
          </div>
        </div>

        {outcome !== null ? (
          <StageEvolutionResult
            from={current.stage}
            to={resultStage}
            passed={outcome}
            word={current.word}
            evolves={mode === "formal" && resultStage !== current.stage}
            busy={busy}
            onContinue={continueTest}
          />
        ) : null}
      </div>
    </section>
  );
}

function StageEvolutionResult({ from, to, passed, word, evolves, busy, onContinue }: {
  from: Stage;
  to: Stage;
  passed: boolean;
  word: string;
  evolves: boolean;
  busy: boolean;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const phoenixReached = evolves && to === 3;
  return (
    <div className={`evolution-result ${passed ? "correct" : "incorrect"} ${phoenixReached ? "phoenix-complete" : ""}`} role="status">
      <div className="evolution-visual" aria-hidden="true">
        <StageMascot stage={from} size={84} />
        {evolves ? <span>→</span> : null}
        {evolves ? <StageMascot stage={to} size={96} /> : null}
      </div>
      <div className="evolution-copy">
        <strong>{phoenixReached
          ? t("test.phoenixTitle")
          : passed && evolves
            ? t("test.evolutionTitle")
            : passed ? t("test.correct") : t("test.practiceAgain")}</strong>
        <p>{phoenixReached
          ? t("test.phoenixDescription", { word })
          : evolves
            ? t("test.evolutionStep", {
                from: t("common.stageName", { stage: from, label: t(`stages.${from}.label`) }),
                to: t("common.stageName", { stage: to, label: t(`stages.${to}.label`) }),
              })
            : passed
              ? t("test.practiceCorrect")
              : t("test.incorrectEvolution", {
                  word,
                  stage: t("common.stageName", { stage: from, label: t(`stages.${from}.label`) }),
                })}</p>
      </div>
      <button className="btn-primary" onClick={onContinue} disabled={busy}>{busy ? t("common.saving") : t("test.continue")}</button>
    </div>
  );
}
