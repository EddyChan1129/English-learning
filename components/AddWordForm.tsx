"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { NewWord, PartOfSpeech } from "@/types";
import { SpeechButton } from "./SpeechButton";
import { RequiredMark, WordMetadataFields } from "./WordMetadataFields";

const EMPTY_SENTENCES = () => Array.from({ length: 2 }, () => ({ sentence: "", explanation: "" }));

export function AddWordForm({ onAdd }: { onAdd: (word: NewWord) => Promise<void> }) {
  const [word, setWord] = useState("");
  const [chineseMeaning, setChineseMeaning] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [partsOfSpeech, setPartsOfSpeech] = useState<PartOfSpeech[]>([]);
  const [commonPhrases, setCommonPhrases] = useState("");
  const [sentences, setSentences] = useState(EMPTY_SENTENCES);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  function updateSentence(index: number, field: "sentence" | "explanation", value: string) {
    setSentences((current) => current.map((entry, i) => i === index ? { ...entry, [field]: value } : entry));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleanSynonyms = synonyms.split(",").map((item) => item.trim()).filter(Boolean);
    const cleanSentences = sentences
      .map(({ sentence, explanation }) => ({ sentence: sentence.trim(), explanation: explanation.trim() }))
      .filter(({ sentence }) => sentence);
    if (!cleanSynonyms.length) return setError(t("add.synonymError"));
    if (!partsOfSpeech.length) return setError(t("add.partsOfSpeechError"));
    if (cleanSentences.length < 2) return setError(t("add.minimumError"));
    const includesTargetWord = cleanSentences.some(({ sentence }) =>
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
        synonyms: cleanSynonyms,
        sentences: cleanSentences.map(({ sentence }) => sentence),
        sentenceExplanations: cleanSentences.map(({ explanation }) => explanation),
        partsOfSpeech,
        commonPhrases: commonPhrases.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
      });
      setWord("");
      setChineseMeaning("");
      setSynonyms("");
      setPartsOfSpeech([]);
      setCommonPhrases("");
      setSentences(EMPTY_SENTENCES());
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
          <RequiredMark />
          <input
            className="field mt-2"
            required
            value={word}
            onChange={(event) => setWord(event.target.value)}
            placeholder="used to be"
          />
        </label>
        <label className="text-sm font-bold">
          {t("add.chineseMeaning")}
          <RequiredMark />
          <input
            className="field mt-2"
            required
            value={chineseMeaning}
            onChange={(event) => setChineseMeaning(event.target.value)}
            placeholder="以前是；曾經是"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-bold">
        {t("add.synonyms")}
        <RequiredMark />
        <span className="font-normal text-[var(--muted)]"> {t("add.commaSeparated")}</span>
        <input className="field mt-2" required value={synonyms} onChange={(event) => setSynonyms(event.target.value)} placeholder="was once, formerly" />
      </label>
      <WordMetadataFields selected={partsOfSpeech} onSelectedChange={setPartsOfSpeech} commonPhrases={commonPhrases} onCommonPhrasesChange={setCommonPhrases} />
      <div className="mt-4 space-y-3">
        <div className="sentence-fields-heading flex items-center justify-between">
          <strong className="text-sm">{t("add.sentences")}<RequiredMark /> <span className="font-normal text-[var(--muted)]">{t("add.minimum")}</span></strong>
          {sentences.length < 4 ? <button type="button" className="text-button" onClick={() => setSentences((current) => [...current, { sentence: "", explanation: "" }])}>{t("add.addSentence")}</button> : null}
        </div>
        {sentences.map(({ sentence, explanation }, index) => (
          <div key={index} className="rounded-lg border border-[var(--line)] bg-[#fbfcff] p-3">
            <div className="flex gap-2">
              <textarea
                className="field min-h-20 resize-y"
                required={index < 2}
                value={sentence}
                onChange={(event) => updateSentence(index, "sentence", event.target.value)}
                placeholder={t("add.sentence", { number: index + 1 })}
                aria-label={t("add.sentence", { number: index + 1 })}
              />
              {sentence ? <SpeechButton text={sentence} label="" /> : null}
            </div>
            <label className="mt-3 block text-sm font-bold">
              {t("add.sentenceExplanation", { number: index + 1 })}
              <input
                className="field mt-2"
                value={explanation}
                onChange={(event) => updateSentence(index, "explanation", event.target.value)}
                placeholder={t("add.sentenceExplanation", { number: index + 1 })}
              />
            </label>
          </div>
        ))}
      </div>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button className="btn-primary mt-6" disabled={busy}>{busy ? t("common.saving") : t("add.save")}</button>
    </form>
  );
}
