"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StageBadge } from "@/components/StageBadge";
import { SpeechButton } from "@/components/SpeechButton";
import { useApp } from "@/components/AppProvider";
import { formatStoredDateTime } from "@/lib/date";
import { isReadyForTest } from "@/lib/spaced-repetition";

export default function UpcomingTestsPage() {
  const { words, wordsLoaded } = useApp();
  const { i18n, t } = useTranslation();
  const scheduledWords = useMemo(() => words
    .filter((word) => word.status === "learning")
    .toSorted((a, b) => Date.parse(a.nextTestDate) - Date.parse(b.nextTestDate)), [words]);
  const dueCount = scheduledWords.filter((word) => isReadyForTest(word)).length;
  const nextWord = scheduledWords.find((word) => !isReadyForTest(word));

  return (
    <div className="upcoming-page mx-auto max-w-5xl animate-rise">
      <header className="upcoming-page-heading">
        <div>
          <p className="eyebrow">{t("upcomingTests.eyebrow")}</p>
          <h1 className="page-title">{t("upcomingTests.title")}</h1>
          <p>{t("upcomingTests.description")}</p>
        </div>
        <span className="count-label">{t("upcomingTests.count", { count: scheduledWords.length })}</span>
      </header>

      {wordsLoaded && scheduledWords.length ? (
        <>
          <section className="upcoming-summary" aria-label={t("upcomingTests.summaryLabel")}>
            <div>
              <span>{t("upcomingTests.readyLabel")}</span>
              <strong>{dueCount}</strong>
              <small>{t("upcomingTests.readyDescription")}</small>
            </div>
            <div>
              <span>{t("upcomingTests.nextLabel")}</span>
              <strong>{nextWord ? nextWord.word : t("upcomingTests.queueClear")}</strong>
              <small>{nextWord
                ? formatStoredDateTime(nextWord.nextTestDate, i18n.resolvedLanguage)
                : t("upcomingTests.queueClearDescription")}</small>
            </div>
            <Link href="/test" className="btn-primary">{t("upcomingTests.startTest")} <span aria-hidden="true">→</span></Link>
          </section>

          <section className="upcoming-ledger" aria-labelledby="upcoming-ledger-title">
            <div className="upcoming-ledger-heading">
              <div>
                <span className="eyebrow">{t("upcomingTests.ledgerEyebrow")}</span>
                <h2 id="upcoming-ledger-title">{t("upcomingTests.ledgerTitle")}</h2>
              </div>
              <p>{t("upcomingTests.ledgerHint")}</p>
            </div>
            <ol>
              {scheduledWords.map((word, index) => {
                const ready = isReadyForTest(word);
                return (
                  <li key={word.id} className={ready ? "ready" : ""}>
                    <Link href={`/history/${word.id}`} aria-label={t("upcomingTests.openWord", { word: word.word })}>
                      <span className="upcoming-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="upcoming-word">
                        <strong>{word.word}</strong>
                        <small>{word.chineseMeanings.join("；")}</small>
                      </span>
                      <StageBadge stage={word.stage} status={word.status} />
                      <time dateTime={word.nextTestDate}>
                        {ready ? <b>{t("upcomingTests.readyNow")}</b> : null}
                        <span>{formatStoredDateTime(word.nextTestDate, i18n.resolvedLanguage)}</span>
                      </time>
                    </Link>
                    <SpeechButton text={word.word} language="en-US" iconOnly className="upcoming-speech-button" />
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      ) : null}

      {!wordsLoaded ? <p className="py-24 text-center text-sm text-[var(--muted)]">{t("upcomingTests.loading")}</p> : null}
      {wordsLoaded && !scheduledWords.length ? (
        <div className="empty-state">
          <strong>{t("upcomingTests.emptyTitle")}</strong>
          <p>{t("upcomingTests.emptyDescription")}</p>
          <Link href="/history" className="btn-primary mt-5 inline-block">{t("upcomingTests.openHistory")}</Link>
        </div>
      ) : null}
    </div>
  );
}
