"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { SpeechButton } from "@/components/SpeechButton";
import { StageBadge } from "@/components/StageBadge";
import { useApp } from "@/components/AppProvider";

export default function WordDetailPage() {
  const { wordId } = useParams<{ wordId: string }>();
  const { words, wordsLoaded } = useApp();
  const { i18n, t } = useTranslation();
  const word = words.find((item) => item.id === wordId);

  if (!wordsLoaded) return <p className="py-24 text-center text-sm text-[var(--muted)]">{t("detail.loading")}</p>;
  if (!word) return <WordNotFound />;

  return (
    <article className="mx-auto max-w-4xl animate-rise">
      <Link href="/history" className="back-link">{t("detail.back")}</Link>

      <header className="detail-heading">
        <div>
          <p className="eyebrow">{t("detail.eyebrow")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <h1 className="font-display text-5xl font-semibold sm:text-7xl">{word.word}</h1>
            <SpeechButton text={word.word} />
          </div>
          <p className="mt-3 text-xl text-[var(--muted)]">{word.chineseMeaning}</p>
        </div>
        <StageBadge stage={word.stage} status={word.status} large />
      </header>

      <section className="stage-track" aria-label={t("detail.progressLabel", { stage: word.stage })}>
        {[1, 2, 3].map((pass) => (
          <div key={pass} className={pass <= word.stage ? "complete" : ""}>
            <span>{pass <= word.stage ? "✓" : pass}</span>
            <strong>{t("detail.pass", { pass })}</strong>
            <small>{pass <= word.stage ? t("common.complete") : pass === word.stage + 1 ? t("detail.next") : t("detail.waiting")}</small>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-[.65fr_1.35fr]">
        <section className="detail-panel">
          <h2>{t("detail.record")}</h2>
          <dl>
            <DefinitionRow label={t("detail.currentStage")} value={t("detail.stageValue", { stage: word.stage })} />
            <DefinitionRow label={t("detail.status")} value={word.status === "mastered" ? t("common.mastered") : t("common.learning")} />
            <DefinitionRow label={t("detail.added")} value={formatDate(word.createdAt, i18n.resolvedLanguage)} />
            <DefinitionRow
              label={t("detail.lastTested")}
              value={word.lastTestedAt ? formatDate(word.lastTestedAt, i18n.resolvedLanguage) : t("detail.notTested")}
            />
            <DefinitionRow
              label={t("detail.nextTest")}
              value={word.status === "mastered" ? t("common.complete") : formatDate(word.nextTestDate, i18n.resolvedLanguage)}
            />
          </dl>
        </section>

        <div className="space-y-6">
          <section className="detail-panel">
            <h2>{t("detail.synonyms")}</h2>
            {word.synonyms.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {word.synonyms.map((synonym) => <span key={synonym} className="synonym-chip">{synonym}</span>)}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">{t("detail.noSynonyms")}</p>
            )}
          </section>
          <section className="detail-panel">
            <h2>{t("detail.sentences")}</h2>
            <ol className="sentence-list">
              {word.sentences.map((sentence, index) => (
                <li key={`${sentence}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{sentence}</p>
                  <SpeechButton text={sentence} label="" />
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </article>
  );
}

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return <div className="definition-row"><dt>{label}</dt><dd>{value}</dd></div>;
}

function formatDate(value: string, language?: string) {
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return new Intl.DateTimeFormat(language ?? "en", { dateStyle: "medium" }).format(date);
}

function WordNotFound() {
  const { t } = useTranslation();
  return (
    <div className="empty-state mx-auto mt-16 max-w-lg">
      <strong>{t("detail.notFound")}</strong>
      <p>{t("detail.removed")}</p>
      <Link href="/history" className="btn-primary mt-5 inline-block">{t("detail.back")}</Link>
    </div>
  );
}
