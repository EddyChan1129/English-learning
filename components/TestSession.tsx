"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StageMascot } from "@/components/StageMascot";
import { SpeechButton } from "@/components/SpeechButton";
import { calculateTestUpdate } from "@/lib/spaced-repetition";
import { getSpellingHintCharacters, isWordAnswerCorrect, makeGapQuestion } from "@/lib/test-helpers";
import type { Stage, WordDocument } from "@/types";

type TestSessionProps = {
  words: WordDocument[];
  mode: "formal" | "random";
  onResult: (word: WordDocument, passed: boolean, usedHint: boolean) => void | Promise<void>;
  onSkip: (word: WordDocument) => void | Promise<void>;
};

export function TestSession({ words, mode, onResult, onSkip }: TestSessionProps) {
  const current = words[0];
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  const gapQuestion = useMemo(() => {
    if (!current) return { sentence: "", answer: "" };
    const source = current.sentences.find((sentence) =>
      makeGapQuestion(sentence, current.word).sentence !== sentence,
    ) ?? current.sentences[0];
    return makeGapQuestion(source, current.word);
  }, [current]);

  function check() {
    if (!current) return;
    setOutcome(isWordAnswerCorrect(answer, gapQuestion.answer));
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

  async function skipQuestion() {
    if (!current) return;
    setBusy(true);
    try {
      await onSkip(current);
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
            <blockquote className="font-display mt-4 text-2xl font-medium leading-relaxed sm:text-3xl">“{gapQuestion.sentence}”</blockquote>
            <p className="mt-3 text-sm text-[var(--muted)]">{t("test.hint", { meaning: current.chineseMeanings.join("；") })}</p>
            {isStageOneTest ? (
              <div className="mt-3">
                {hintVisible ? (
                  <div className="spelling-hint" aria-live="polite" aria-label={t("test.spellingHint", { hint: "" })}>
                    <span>{t("test.spellingHintLabel")}</span>
                    <span className="spelling-characters" aria-hidden="true">
                      {getSpellingHintCharacters(gapQuestion.answer, answer).map((part, index) => (
                        <span key={`${index}-${part.character}`} className={`spelling-character ${part.state}`}>{part.character}</span>
                      ))}
                    </span>
                  </div>
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
              <div className="test-answer-actions">
                <Button size="lg" disabled={outcome !== null || busy}>{t("test.check")}</Button>
                <Button type="button" size="lg" variant="outline" disabled={outcome !== null || busy} onClick={() => void skipQuestion()}>{t("test.skipQuestion")}</Button>
              </div>
            </form>
            {outcome === null ? <p className="mt-2 text-xs text-[var(--muted)]">{t("test.skipQuestionHint")}</p> : null}
          </div>
        </div>

        {outcome !== null ? (
          <StageEvolutionResult
            key={current.id}
            from={current.stage}
            to={resultStage}
            passed={outcome}
            word={current.word}
            correctAnswer={gapQuestion.answer}
            evolves={mode === "formal" && resultStage !== current.stage}
            busy={busy}
            onContinue={continueTest}
          />
        ) : null}
      </div>
    </section>
  );
}

function StageEvolutionResult({ from, to, passed, word, correctAnswer, evolves, busy, onContinue }: {
  from: Stage;
  to: Stage;
  passed: boolean;
  word: string;
  correctAnswer: string;
  evolves: boolean;
  busy: boolean;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const [animationDone, setAnimationDone] = useState(!evolves);
  const phoenixReached = evolves && to === 3;
  const direction = to > from ? "upgrade" : "downgrade";
  return (
    <Card className={`evolution-result ${passed ? "correct" : "incorrect"} ${phoenixReached ? "phoenix-complete" : ""} ${direction} ${animationDone ? "animation-done" : "animating"}`} role="status">
      {evolves && !animationDone ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="evolution-skip"
          aria-label={t("test.skipEvolution")}
          title={t("test.skipEvolution")}
          onClick={() => setAnimationDone(true)}
        >
          ×
        </Button>
      ) : null}
      <div className="evolution-visual" aria-hidden="true">
        <span className="evolution-from"><StageMascot stage={from} size={84} /></span>
        {evolves ? <span className="evolution-arrow">→</span> : null}
        {evolves ? (
          <span className="evolution-to" onAnimationEnd={() => setAnimationDone(true)}>
            <StageMascot stage={to} size={96} />
          </span>
        ) : null}
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
                  word: correctAnswer,
                  stage: t("common.stageName", { stage: from, label: t(`stages.${from}.label`) }),
                })}</p>
        {!passed ? <SpeechButton text={correctAnswer} label={t("test.listenCorrectAnswer")} /> : null}
      </div>
      <Button onClick={onContinue} disabled={busy}>{busy ? t("common.saving") : t("test.continue")}</Button>
    </Card>
  );
}
