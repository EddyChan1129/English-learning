"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { NewWord, PartOfSpeech } from "@/types";
import { SpeechButton } from "./SpeechButton";
import { OptionalWordFields } from "./WordMetadataFields";

export function AddWordForm({ onAdd }: { onAdd: (word: NewWord) => Promise<void> }) {
  const [word, setWord] = useState("");
  const [chineseMeaning, setChineseMeaning] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [partsOfSpeech, setPartsOfSpeech] = useState<PartOfSpeech[]>([]);
  const [commonPhrases, setCommonPhrases] = useState("");
  const [sentences, setSentences] = useState(["", ""]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  function updateSentence(index: number, value: string) {
    setSentences((current) => current.map((sentence, i) => i === index ? value : sentence));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleanSentences = sentences.map((sentence) => sentence.trim()).filter(Boolean);
    if (cleanSentences.length < 2) return setError(t("add.minimumError"));
    const includesTargetWord = cleanSentences.some((sentence) =>
      sentence.toLowerCase().includes(word.trim().toLowerCase()),
    );
    if (!includesTargetWord) {
      return setError(t("add.targetError"));
    }
    setBusy(true);
    setError("");
    try {
      await onAdd({
        word: word.trim(),
        chineseMeaning: chineseMeaning.trim(),
        synonyms: synonyms.split(",").map((item) => item.trim()).filter(Boolean),
        sentences: cleanSentences,
        partsOfSpeech,
        commonPhrases: commonPhrases.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
      });
      setWord("");
      setChineseMeaning("");
      setSynonyms("");
      setPartsOfSpeech([]);
      setCommonPhrases("");
      setSentences(["", ""]);
    } catch {
      setError(t("add.saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card word-form p-6 sm:p-8" aria-busy={busy}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{t("add.eyebrow")}</p>
          <h2 className="font-display mt-1 text-3xl font-semibold">{t("add.title")}</h2>
        </div>
        {word.trim() ? <SpeechButton text={word} /> : null}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">
          {t("add.targetWord")}
          <input
            className="field mt-2"
            required
            value={word}
            onChange={(event) => setWord(event.target.value)}
            placeholder="serendipity"
          />
        </label>
        <label className="text-sm font-bold">
          {t("add.chineseMeaning")}
          <input
            className="field mt-2"
            required
            value={chineseMeaning}
            onChange={(event) => setChineseMeaning(event.target.value)}
            placeholder="意外發現美好事物的運氣"
          />
        </label>
      </div>
      <div className="desktop-word-details mt-4">
        <OptionalWordFields synonyms={synonyms} onSynonymsChange={setSynonyms} selected={partsOfSpeech} onSelectedChange={setPartsOfSpeech} commonPhrases={commonPhrases} onCommonPhrasesChange={setCommonPhrases} />
      </div>
      <details className="mobile-word-details">
        <summary><span>{t("add.moreDetails")}</span><small>{t("add.optional")}</small></summary>
        <OptionalWordFields synonyms={synonyms} onSynonymsChange={setSynonyms} selected={partsOfSpeech} onSelectedChange={setPartsOfSpeech} commonPhrases={commonPhrases} onCommonPhrasesChange={setCommonPhrases} />
      </details>
      <div className="mt-4 space-y-3">
        <div className="sentence-fields-heading flex items-center justify-between">
          <strong className="text-sm">{t("add.sentences")} <span className="font-normal text-[var(--muted)]">{t("add.minimum")}</span></strong>
          <button type="button" className="text-button" onClick={() => setSentences((current) => [...current, ""])}>{t("add.addSentence")}</button>
        </div>
        {sentences.map((sentence, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              className="field min-h-20 resize-y"
              required={index < 2}
              value={sentence}
              onChange={(event) => updateSentence(index, event.target.value)}
              placeholder={t("add.sentence", { number: index + 1 })}
            />
            {sentence ? <SpeechButton text={sentence} label="" /> : null}
          </div>
        ))}
      </div>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button className="btn-primary mt-6" disabled={busy}>{busy ? t("common.saving") : t("add.save")}</button>
    </form>
  );
}
