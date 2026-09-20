"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StageMascot } from "@/components/StageMascot";
import { SpeechButton } from "@/components/SpeechButton";
import { makeMultipleChoice } from "@/lib/multiple-choice";
import { calculateTestUpdate } from "@/lib/spaced-repetition";
import { playEvolutionSound } from "@/lib/evolution-sounds";
import { getMissingVerbEnding, getSpellingHint, getSpellingHintCharacters, getVerbEndingHint, isWordAnswerCorrect, makeWordTestQuestion, maskTestAnswer } from "@/lib/test-helpers";
import type { Stage, WordDocument } from "@/types";

type TestSessionProps = {
  words: WordDocument[];
  choicePool: WordDocument[];
  mode: "formal" | "random";
  onResult: (word: WordDocument, passed: boolean, usedHint: boolean) => void | Promise<void>;
  onSkip: (word: WordDocument) => void | Promise<void>;
};

type TestOutcome = "correct" | "incorrect" | "skipped" | null;
const VERB_PARTS = new Set(["verb", "phrasalVerb", "verbPhrase", "auxiliaryVerb"]);

export function TestSession({ words, choicePool, mode, onResult, onSkip }: TestSessionProps) {
  const current = words[0];
  // TestQueue remounts this component for each card, keeping options fixed while answering.
  const [choices] = useState(() => current && mode === "formal" && current.stage === 0 ? makeMultipleChoice(current, choicePool) : null);
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<TestOutcome>(null);
  const [acceptedEnding, setAcceptedEnding] = useState<"s" | "ed" | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef<HTMLElement>(null);
  const [soundFailed, setSoundFailed] = useState(false);
  const stopEvolutionSound = useRef<(() => void) | null>(null);
  const { t } = useTranslation();

  useEffect(() => () => stopEvolutionSound.current?.(), []);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229
        || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !/^[1-5]$/.test(event.key)) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable]")
        && !target.matches("[data-test-answer]")) return;
      const button = sessionRef.current?.querySelector<HTMLButtonElement>(`button[aria-keyshortcuts="${event.key}"]:not(:disabled)`);
      if (!button) return;
      event.preventDefault();
      button.click();
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function playUpgradeSound(stage: Stage) {
    stopEvolutionSound.current?.();
    setSoundFailed(false);
    stopEvolutionSound.current = playEvolutionSound(stage, () => setSoundFailed(true));
  }

  const gapQuestion = useMemo(() => {
    if (!current) return { sentence: "", answer: "", sourceSentence: "", translation: "" };
    return makeWordTestQuestion(current);
  }, [current]);
  const verbEndingHint = current && current.partsOfSpeech.some((part) => VERB_PARTS.has(part))
    ? getVerbEndingHint(gapQuestion.answer, current.word)
    : null;

  function check() {
    if (!current || outcome !== null || busy || !answer.trim()) return;
    const missingEnding = getMissingVerbEnding(answer, gapQuestion.answer);
    const accepted = !choices && verbEndingHint && missingEnding === verbEndingHint ? verbEndingHint : null;
    const passed = choices ? answer === current.id : isWordAnswerCorrect(answer, gapQuestion.answer) || accepted !== null;
    setAcceptedEnding(accepted);
    setOutcome(passed ? "correct" : "incorrect");
    stopEvolutionSound.current?.();
    if (mode === "formal" && passed && current.stage < 3) {
      playUpgradeSound((current.stage + 1) as Stage);
    }
  }

  async function continueTest() {
    if (!current || outcome === null || busy) return;
    stopEvolutionSound.current = null;
    setBusy(true);
    try {
      if (outcome === "skipped") await onSkip(current);
      else await onResult(current, outcome === "correct", hintVisible);
    } finally {
      setBusy(false);
    }
  }

  function skipQuestion() {
    if (!current || outcome !== null || busy) return;
    stopEvolutionSound.current?.();
    setOutcome("skipped");
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
  const isFinalTest = mode === "formal" && current.stage >= 2;
  const showExplanations = !isFinalTest || outcome !== null;
  const fullMeaning = (current.chineseMeanings?.length ? current.chineseMeanings : [current.chineseMeaning]).join("；");
  const visibleMeaning = outcome === null
    ? maskTestAnswer(fullMeaning, current.word, gapQuestion.answer)
    : fullMeaning;
  const resultStage = outcome === null || mode === "random"
    ? current.stage
    : calculateTestUpdate(current.stage, outcome === "correct", new Date(0).toISOString()).stage;

  return (
    <section ref={sessionRef} className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[#f1effb] px-6 py-4">
        <div>
          <span className="eyebrow">{t(mode === "formal" ? "test.review" : "test.randomReview")}</span>
          <span className="ml-3 text-xs text-[var(--muted)]">{t("test.remaining", { count: words.length })}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="stage-badge">{t(choices ? "test.multipleChoice" : mode === "formal" ? (gapQuestion.sentence ? "test.gapFill" : "test.meaningTest") : "test.noStage")}</span>
          {outcome !== null || (!choices && (!isFinalTest || !gapQuestion.sentence)) ? <SpeechButton text={current.word} language="en-US" iconOnly shortcut="4" /> : null}
        </div>
      </div>
      <div className="p-6 sm:p-9">
        <div className="test-question-layout">
          <aside className={`test-stage-identity stage-${current.stage}`}>
            <StageMascot stage={current.stage} size={150} />
            <strong>{t("common.stageName", { stage: current.stage, label: t(`stages.${current.stage}.label`) })}</strong>
            <small>{t(mode === "formal" ? "test.currentEvolution" : "test.practiceStage")}</small>
          </aside>
          <div>
            <p className="text-sm font-bold text-[var(--muted)]">{t(choices ? "test.chooseEnglish" : gapQuestion.sentence ? "test.gapPrompt" : isFinalTest ? "test.listenPrompt" : "test.meaningPrompt")}</p>
            {!choices && gapQuestion.sentence ? <blockquote className="font-display mt-4 text-2xl font-medium leading-relaxed sm:text-3xl">“{gapQuestion.sentence}”</blockquote> : null}
            {showExplanations ? <p className="mt-4 text-base font-bold">{t("test.wordMeaning", { meaning: visibleMeaning })}</p> : null}
            {isFinalTest ? <p className="mt-4 whitespace-pre-wrap font-mono text-xl font-bold text-[var(--violet)]" aria-label={t("test.spellingHint", { hint: getSpellingHint(gapQuestion.answer) })}>{getSpellingHint(gapQuestion.answer)}</p> : null}
            {!choices && showExplanations && gapQuestion.translation ? <p className="test-sentence-translation" aria-label={t("test.translation")}>{gapQuestion.translation}</p> : null}
            {!choices && showExplanations ? <p className="mt-3 text-sm text-[var(--muted)]">{current.synonyms.length
              ? t("test.hint", { synonyms: current.synonyms.join(" · ") })
              : t("test.noSynonymsHint")}</p> : null}
            {!choices && showExplanations && verbEndingHint ? (
              <p className="grammar-hint" role="note">{t(`test.verbEndingHint.${verbEndingHint}`)}</p>
            ) : null}
            {isStageOneTest && !choices ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {gapQuestion.sourceSentence ? <SpeechButton text={gapQuestion.sourceSentence} language="en-US" label={t("test.listenCorrectAnswer")} shortcut="5" /> : null}
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

            <form className={`mt-7 flex flex-col gap-3 ${choices ? "" : "sm:flex-row"}`} onSubmit={(event) => {
              event.preventDefault();
              check();
            }}>
              {choices ? (
                <fieldset className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2" disabled={outcome !== null || busy}>
                  <legend className="sr-only">{t("test.chooseEnglish")}</legend>
                  {choices.map((choice, index) => (
                    <label key={choice.id} className={`flex min-h-12 min-w-0 cursor-pointer items-center gap-3 rounded-lg border p-3 ${outcome !== null && choice.id === current.id ? "border-[var(--green)] bg-[var(--mint)]" : answer === choice.id ? "border-[var(--action)] bg-[var(--highlight)]" : "border-[var(--line)]"}`}>
                      <input data-test-answer type="radio" name="mc-answer" value={choice.id} checked={answer === choice.id} onChange={() => setAnswer(choice.id)} required />
                      <span className="font-mono" aria-hidden="true">{String.fromCharCode(65 + index)}.</span>
                      <span className="min-w-0 break-words">{choice.word}</span>
                      {outcome !== null && choice.id === current.id ? <span aria-label={t("test.correct")}>✓</span> : null}
                    </label>
                  ))}
                </fieldset>
              ) : <input
                data-test-answer
                className="field flex-1"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={outcome !== null}
                autoFocus
                placeholder={t("test.answerPlaceholder")}
                required
              />}
              <div className="test-answer-actions">
                <Button size="lg" aria-keyshortcuts="1" aria-label={t("test.check")} title={t("test.check")} disabled={outcome !== null || busy}><svg className="test-action-icon" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg><span className="test-action-label">{t("test.check")}</span> <kbd className="text-xs opacity-60">(1)</kbd></Button>
                <Button type="button" size="lg" variant="outline" disabled={outcome !== null || busy} onClick={skipQuestion} aria-keyshortcuts="2" aria-label={t("test.skipQuestion")} title={t("test.skipQuestion")}><svg className="test-action-icon" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 5 10 7-10 7zM19 5v14" /></svg><span className="test-action-label">{t("test.skipQuestion")}</span> <kbd className="text-xs opacity-60">(2)</kbd></Button>
              </div>
            </form>
            {outcome === null ? <p className="mt-2 text-xs text-[var(--muted)]">{t("test.skipQuestionHint")}</p> : null}
          </div>
        </div>

        {soundFailed && outcome === "correct" && mode === "formal" && current.stage < 3 ? (
          <Button type="button" variant="outline" className="mt-4" onClick={() => playUpgradeSound((current.stage + 1) as Stage)}>
            ♪ {t("common.listen")} · {t("common.stageName", { stage: current.stage + 1, label: t(`stages.${current.stage + 1}.label`) })}
          </Button>
        ) : null}
        {outcome !== null ? (
          <StageEvolutionResult
            key={current.id}
            from={current.stage}
            to={resultStage}
            passed={outcome === "correct"}
            skipped={outcome === "skipped"}
            word={current.word}
            correctAnswer={choices ? current.word : gapQuestion.answer}
            answerSentence={gapQuestion.sourceSentence || current.word}
            acceptedEnding={acceptedEnding}
            evolves={mode === "formal" && outcome === "correct" && resultStage !== current.stage}
            busy={busy}
            onSkipAnimation={() => stopEvolutionSound.current?.()}
            onContinue={continueTest}
          />
        ) : null}
      </div>
    </section>
  );
}

function StageEvolutionResult({ from, to, passed, skipped, word, correctAnswer, answerSentence, acceptedEnding, evolves, busy, onSkipAnimation, onContinue }: {
  from: Stage;
  to: Stage;
  passed: boolean;
  skipped: boolean;
  word: string;
  correctAnswer: string;
  answerSentence: string;
  acceptedEnding: "s" | "ed" | null;
  evolves: boolean;
  busy: boolean;
  onSkipAnimation: () => void;
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
          onClick={() => {
            onSkipAnimation();
            setAnimationDone(true);
          }}
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
          : skipped ? t("test.skippedTitle")
          : passed && evolves
            ? t("test.evolutionTitle")
            : passed ? t("test.correct") : t("test.practiceAgain")}</strong>
        <p>{phoenixReached
          ? t("test.phoenixDescription", { word })
          : skipped ? t("test.skippedDescription", { word: correctAnswer })
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
        {acceptedEnding ? (
          <p className="grammar-hint">{t(`test.acceptedMissingEnding.${acceptedEnding}`, { word: correctAnswer })}</p>
        ) : null}
        {!passed ? <SpeechButton text={answerSentence} language="en-US" label={t("test.listenCorrectAnswer")} shortcut="5" /> : null}
      </div>
      <Button onClick={onContinue} disabled={busy} aria-keyshortcuts="3">{busy ? t("common.saving") : t("test.continue")} <kbd className="text-xs opacity-60">(3)</kbd></Button>
    </Card>
  );
}
