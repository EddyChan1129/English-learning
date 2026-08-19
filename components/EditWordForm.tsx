"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { NewWord, WordDocument } from "@/types";
import { SpeechButton } from "./SpeechButton";

export function EditWordForm({ word: initialWord, onSave, onCancel }: {
  word: WordDocument;
  onSave: (word: NewWord) => Promise<void>;
  onCancel: () => void;
}) {
  const [word, setWord] = useState(initialWord.word);
  const [chineseMeaning, setChineseMeaning] = useState(initialWord.chineseMeaning);
  const [synonyms, setSynonyms] = useState(initialWord.synonyms.join(", "));
  const [sentences, setSentences] = useState(initialWord.sentences);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  function updateSentence(index: number, value: string) {
    setSentences((current) => current.map((sentence, position) => position === index ? value : sentence));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleanSentences = sentences.map((sentence) => sentence.trim()).filter(Boolean);
    if (cleanSentences.length < 2) return setError(t("add.minimumError"));
    if (!cleanSentences.some((sentence) => sentence.toLowerCase().includes(word.trim().toLowerCase()))) {
      return setError(t("add.targetError"));
    }

    setBusy(true);
    setError("");
    try {
      await onSave({
        word: word.trim(),
        chineseMeaning: chineseMeaning.trim(),
        synonyms: synonyms.split(",").map((item) => item.trim()).filter(Boolean),
        sentences: cleanSentences,
      });
    } catch {
      setError(t("detail.updateError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="detail-panel mt-6" aria-busy={busy}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <h2 className="font-display text-2xl font-semibold normal-case tracking-normal">{t("detail.editWord")}</h2>
        {word.trim() ? <SpeechButton text={word} /> : null}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">{t("add.targetWord")}<input className="field mt-2" required value={word} onChange={(event) => setWord(event.target.value)} /></label>
        <label className="text-sm font-bold">{t("add.chineseMeaning")}<input className="field mt-2" required value={chineseMeaning} onChange={(event) => setChineseMeaning(event.target.value)} /></label>
      </div>
      <label className="mt-4 block text-sm font-bold">
        {t("add.synonyms")} <span className="font-normal text-[var(--muted)]">{t("add.commaSeparated")}</span>
        <input className="field mt-2" value={synonyms} onChange={(event) => setSynonyms(event.target.value)} />
      </label>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <strong className="text-sm">{t("add.sentences")} <span className="font-normal text-[var(--muted)]">{t("add.minimum")}</span></strong>
          <button type="button" className="text-button" onClick={() => setSentences((current) => [...current, ""])}>{t("add.addSentence")}</button>
        </div>
        {sentences.map((sentence, index) => (
          <textarea key={index} className="field min-h-20 resize-y" required={index < 2} value={sentence} onChange={(event) => updateSentence(index, event.target.value)} placeholder={t("add.sentence", { number: index + 1 })} />
        ))}
      </div>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" disabled={busy}>{busy ? t("common.saving") : t("detail.saveChanges")}</button>
        <button type="button" className="btn-secondary" disabled={busy} onClick={onCancel}>{t("common.cancel")}</button>
      </div>
    </form>
  );
}
