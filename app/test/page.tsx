"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TestSession } from "@/components/TestSession";
import { useApp } from "@/components/AppProvider";
import { rotateFirst, shuffled } from "@/lib/test-helpers";
import type { WordDocument } from "@/types";

type TestMode = "formal" | "random";

export default function TestPage() {
  const { dueWords, words, wordsLoaded, saveTestResult } = useApp();
  const [mode, setMode] = useState<TestMode>("formal");
  const [randomWords, setRandomWords] = useState<WordDocument[]>([]);
  const { t } = useTranslation();

  function startRandomTest() {
    setRandomWords(shuffled(words));
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
          <span className="count-label">{t(mode === "formal" ? "testPage.due" : "testPage.allWords", { count: mode === "formal" ? dueWords.length : words.length })}</span>
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
          ? <FormalTestQueue initialWords={dueWords} words={words} onResult={saveTestResult} />
          : <TestSession
              key={`random-${randomWords[0]?.id ?? "empty"}`}
              mode="random"
              words={randomWords}
              onSkip={() => setRandomWords((current) => rotateFirst(current))}
              onResult={() => setRandomWords((current) => current.slice(1))}
            />}

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t("testPage.prompt")} <Link href="/history" className="text-button">{t("testPage.openHistory")}</Link>
      </p>
    </div>
  );
}

function FormalTestQueue({ initialWords, words, onResult }: {
  initialWords: WordDocument[];
  words: WordDocument[];
  onResult: (word: WordDocument, passed: boolean, usedHint: boolean) => Promise<void>;
}) {
  const [queueIds, setQueueIds] = useState(() => initialWords.map((word) => word.id));
  const queue = useMemo(() => queueIds
    .map((id) => words.find((word) => word.id === id))
    .filter((word): word is WordDocument => Boolean(word)), [queueIds, words]);

  return (
    <TestSession
      key={`formal-${queue[0]?.id ?? "empty"}`}
      mode="formal"
      words={queue}
      onSkip={() => setQueueIds((current) => rotateFirst(current))}
      onResult={async (word, passed, usedHint) => {
        await onResult(word, passed, usedHint);
        setQueueIds((current) => current.filter((id) => id !== word.id));
      }}
    />
  );
}
