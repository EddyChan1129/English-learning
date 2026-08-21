"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { SpeechButton } from "@/components/SpeechButton";
import { StageBadge } from "@/components/StageBadge";
import { useApp } from "@/components/AppProvider";
import { EditWordForm } from "@/components/EditWordForm";
import { formatStoredDate, formatStoredDateTime } from "@/lib/date";
import type { NewWord } from "@/types";

export default function WordDetailPage() {
  const { wordId } = useParams<{ wordId: string }>();
  const { words, wordsLoaded, editWord, setWordEnabled } = useApp();
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState("");
  const { i18n, t } = useTranslation();
  const word = words.find((item) => item.id === wordId);

  if (!wordsLoaded) return <p className="py-24 text-center text-sm text-[var(--muted)]">{t("detail.loading")}</p>;
  if (!word) return <WordNotFound />;

  async function saveChanges(nextWord: NewWord) {
    await editWord(wordId, nextWord);
    setEditing(false);
  }

  async function toggleActive() {
    if (!word) return;
    setActionError("");
    try {
      await setWordEnabled(word, word.status === "inactive");
    } catch {
      setActionError(t("detail.statusError"));
    }
  }

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
          {word.partsOfSpeech.length ? <div className="mt-3 flex flex-wrap gap-2">{word.partsOfSpeech.map((part) => <span key={part} className="part-chip">{t(`partsOfSpeech.${part}`)}</span>)}</div> : null}
        </div>
        <div className="detail-actions">
          <StageBadge stage={word.stage} status={word.status} large />
          <div>
            <button className="btn-secondary" onClick={() => setEditing((current) => !current)}>{editing ? t("common.cancel") : t("common.edit")}</button>
            <button className={word.status === "inactive" ? "btn-secondary" : "btn-danger"} onClick={toggleActive}>
              {word.status === "inactive" ? t("detail.reactivate") : t("detail.deactivate")}
            </button>
          </div>
        </div>
      </header>

      {actionError ? <p className="feedback error mt-5" role="alert">{actionError}</p> : null}
      {word.status === "inactive" ? <p className="inactive-note">{t("detail.inactiveNote")}</p> : null}
      {editing ? <EditWordForm word={word} onSave={saveChanges} onCancel={() => setEditing(false)} /> : null}

      <section className={`stage-track ${editing ? "mt-6" : ""}`} aria-label={t("detail.progressLabel", { stage: word.stage })}>
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
            <DefinitionRow label={t("detail.status")} value={word.status === "mastered" ? t("common.mastered") : word.status === "inactive" ? t("common.inactive") : t("common.learning")} />
            <DefinitionRow label={t("detail.added")} value={formatStoredDate(word.createdAt, i18n.resolvedLanguage)} />
            <DefinitionRow
              label={t("detail.lastTested")}
              value={word.lastTestedAt ? formatStoredDateTime(word.lastTestedAt, i18n.resolvedLanguage) : t("detail.notTested")}
            />
            <DefinitionRow
              label={t("detail.nextTest")}
              value={word.status === "mastered" ? t("common.complete") : word.status === "inactive" ? t("detail.paused") : formatStoredDateTime(word.nextTestDate, i18n.resolvedLanguage)}
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
            <h2>{t("detail.commonPhrases")}</h2>
            {word.commonPhrases.length ? (
              <ul className="phrase-list">{word.commonPhrases.map((phrase) => <li key={phrase}><span>{phrase}</span><SpeechButton text={phrase} label="" /></li>)}</ul>
            ) : <p className="mt-4 text-sm text-[var(--muted)]">{t("detail.noCommonPhrases")}</p>}
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
