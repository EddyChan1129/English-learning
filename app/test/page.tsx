"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TestSession } from "@/components/TestSession";
import { useApp } from "@/components/AppProvider";
import { shuffled } from "@/lib/test-helpers";
import type { WordDocument } from "@/types";

type TestMode = "formal" | "random";
type SessionResult = "correct" | "incorrect" | "skipped";

export default function TestPage() {
  const { dueWords, words, wordsLoaded, saveTestResult } = useApp();
  const [mode, setMode] = useState<TestMode>("formal");
  const [randomSession, setRandomSession] = useState<{ id: number; words: WordDocument[] }>({ id: 0, words: [] });
  const { t } = useTranslation();
  const testableWords = useMemo(() => words.filter((word) => word.status !== "inactive"), [words]);

  function startRandomTest() {
    setRandomSession((current) => ({ id: current.id + 1, words: shuffled(testableWords) }));
    setMode("random");
  }

  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <header className="mb-7 border-b border-[var(--line)] pb-5">
        <p className="eyebrow">{t("testPage.eyebrow")}</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title">{t("testPage.title")}</h1>
            <p className="mt-2 text-[var(--muted)]">{t(mode === "formal" ? "testPage.description" : "testPage.randomDescription")}</p>
          </div>
          <span className="count-label">{t(mode === "formal" ? "testPage.due" : "testPage.allWords", { count: mode === "formal" ? dueWords.length : testableWords.length })}</span>
        </div>
      </header>

      <section className="card mb-6 p-4" aria-labelledby="test-mode-label">
        <p id="test-mode-label" className="mb-3 text-sm font-bold">{t("testPage.modeLabel")}</p>
        <div className="filter-tabs">
          <button type="button" className={mode === "formal" ? "active" : ""} aria-pressed={mode === "formal"} onClick={() => setMode("formal")}>{t("testPage.formalMode")}</button>
          <button type="button" className={mode === "random" ? "active" : ""} aria-pressed={mode === "random"} onClick={startRandomTest} disabled={!wordsLoaded}>{t("testPage.randomMode")}</button>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">{t(mode === "formal" ? "testPage.formalModeDescription" : "testPage.randomModeDescription")}</p>
      </section>

      {!wordsLoaded
        ? <p className="py-24 text-center text-sm text-[var(--muted)]">{t("testPage.preparing")}</p>
        : mode === "formal"
          ? <TestQueue mode="formal" initialWords={dueWords} words={words} onResult={saveTestResult} />
          : <TestQueue key={randomSession.id} mode="random" initialWords={randomSession.words} words={words} onResult={saveTestResult} />}

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t("testPage.prompt")} <Link href="/history" className="text-button">{t("testPage.openHistory")}</Link>
      </p>
    </div>
  );
}

function TestQueue({ mode, initialWords, words, onResult }: {
  mode: TestMode;
  initialWords: WordDocument[];
  words: WordDocument[];
  onResult: (word: WordDocument, passed: boolean, usedHint: boolean) => Promise<void>;
}) {
  const [sessionIds] = useState(() => initialWords.map((word) => word.id));
  const [queueIds, setQueueIds] = useState(() => initialWords.map((word) => word.id));
  const [results, setResults] = useState<Record<string, SessionResult>>({});
  const wordsById = useMemo(() => new Map(words.map((word) => [word.id, word])), [words]);
  const queue = useMemo(() => queueIds
    .map((id) => wordsById.get(id))
    .filter((word): word is WordDocument => Boolean(word && word.status !== "inactive")), [queueIds, wordsById]);

  async function complete(word: WordDocument, result: SessionResult, usedHint: boolean) {
    if (mode === "formal") await onResult(word, result === "correct", usedHint);
    setResults((current) => ({ ...current, [word.id]: result }));
    setQueueIds((current) => current.filter((id) => id !== word.id));
  }

  return (
    <div className="test-session-stack">
      <TestProgress sessionIds={sessionIds} currentId={queue[0]?.id} results={results} wordsById={wordsById} />
      <TestSession
        key={`${mode}-${queue[0]?.id ?? "empty"}`}
        mode={mode}
        words={queue}
        onSkip={(word) => complete(word, "skipped", false)}
        onResult={(word, passed, usedHint) => complete(word, passed ? "correct" : "incorrect", usedHint)}
      />
    </div>
  );
}

function TestProgress({ sessionIds, currentId, results, wordsById }: {
  sessionIds: string[];
  currentId?: string;
  results: Record<string, SessionResult>;
  wordsById: Map<string, WordDocument>;
}) {
  const { t } = useTranslation();
  const position = currentId ? sessionIds.indexOf(currentId) + 1 : sessionIds.length;

  return (
    <section className="test-progress-ledger" aria-label={t("test.progressLabel")}>
      <div className="test-progress-heading">
        <div><span>{t("test.progressEyebrow")}</span><strong>{t("test.progressPosition", { current: position, total: sessionIds.length })}</strong></div>
        <small>{t("test.progressLegend")}</small>
      </div>
      <ol className="test-progress-track">
        {sessionIds.map((id, index) => {
          const unavailable = !wordsById.get(id) || wordsById.get(id)?.status === "inactive";
          const result = results[id] ?? (unavailable ? "skipped" : undefined);
          const state = result === "correct" ? "correct" : result ? "incorrect" : id === currentId ? "current" : "pending";
          const mark = state === "correct" ? "✓" : state === "incorrect" ? "×" : String(index + 1);
          return <li key={id} className={state} aria-current={state === "current" ? "step" : undefined} aria-label={t(`test.progressState.${state}`, { number: index + 1 })}>{mark}</li>;
        })}
      </ol>
    </section>
  );
}
