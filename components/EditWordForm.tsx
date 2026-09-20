"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeGapQuestion } from "@/lib/test-helpers";
import { isDuplicateVocabularyError } from "@/lib/vocabulary";
import { getLanguageName } from "@/lib/languages";
import { useApp } from "@/components/AppProvider";
import type { NewWord, PartOfSpeech, WordDocument } from "@/types";
import { ExampleGapPreview } from "./ExampleGapPreview";
import { ChineseMeaningFields } from "./ChineseMeaningFields";
import { SpeechButton } from "./SpeechButton";
import { VocabularyCategoryFields } from "./VocabularyCategoryFields";
import { AdvancedWordFields, RequiredMark, WordMetadataFields } from "./WordMetadataFields";

export function EditWordForm({ word: initialWord, categories, onSave, onCancel }: {
  word: WordDocument;
  categories: string[];
  onSave: (word: NewWord) => Promise<void>;
  onCancel: () => void;
}) {
  const [word, setWord] = useState(initialWord.word);
  const [chineseMeanings, setChineseMeanings] = useState(initialWord.chineseMeanings);
  const [synonyms, setSynonyms] = useState(initialWord.synonyms.join(", "));
  const [partsOfSpeech, setPartsOfSpeech] = useState<PartOfSpeech[]>(initialWord.partsOfSpeech);
  const [commonPhrases, setCommonPhrases] = useState(initialWord.commonPhrases.join("\n"));
  const [selectedCategories, setSelectedCategories] = useState(initialWord.categories ?? []);
  const [sentences, setSentences] = useState(() => initialWord.sentences.map((sentence, index) => ({
    sentence,
    explanation: initialWord.sentenceExplanations[index] ?? "",
  })));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { languagePreferences } = useApp();
  const { i18n, t } = useTranslation();
  const learningLanguageName = getLanguageName(languagePreferences.learningLanguage, i18n.resolvedLanguage);
  const explanationLanguageName = getLanguageName(languagePreferences.explanationLanguage, i18n.resolvedLanguage);
  const availableCategories = [...new Set([...categories, ...(initialWord.categories ?? [])])].sort((a, b) => a.localeCompare(b));

  function updateSentence(index: number, field: "sentence" | "explanation", value: string) {
    setSentences((current) => current.map((entry, position) => position === index ? { ...entry, [field]: value } : entry));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleanSynonyms = synonyms.split(",").map((item) => item.trim()).filter(Boolean);
    const cleanChineseMeanings = chineseMeanings.map((item) => item.trim()).filter(Boolean);
    const cleanSentences = sentences
      .map(({ sentence, explanation }) => ({ sentence: sentence.trim(), explanation: explanation.trim() }))
      .filter(({ sentence }) => sentence);
    if (!cleanChineseMeanings.length) return setError(t("add.chineseMeaningError", { language: explanationLanguageName }));
    if (!partsOfSpeech.length) return setError(t("add.partsOfSpeechError"));
    if (cleanSentences.length < 2) return setError(t("add.minimumError"));
    if (!cleanSentences.some(({ sentence }) => makeGapQuestion(sentence, word).sentence !== sentence)) {
      return setError(t("add.targetError"));
    }

    setBusy(true);
    setError("");
    try {
      await onSave({
        word: word.trim(),
        chineseMeaning: cleanChineseMeanings[0],
        chineseMeanings: cleanChineseMeanings,
        synonyms: cleanSynonyms,
        sentences: cleanSentences.map(({ sentence }) => sentence),
        sentenceExplanations: cleanSentences.map(({ explanation }) => explanation),
        partsOfSpeech,
        commonPhrases: commonPhrases.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
        categories: selectedCategories,
      });
    } catch (saveError) {
      setError(isDuplicateVocabularyError(saveError)
        ? t("add.duplicateError", { word: word.trim() })
        : t("detail.updateError"));
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
        <label className="text-sm font-bold">{t("add.targetWord", { language: learningLanguageName })}<RequiredMark /><input className="field mt-2" required value={word} onChange={(event) => setWord(event.target.value)} /></label>
        <ChineseMeaningFields values={chineseMeanings} languageName={explanationLanguageName} onChange={setChineseMeanings} />
      </div>
      <WordMetadataFields selected={partsOfSpeech} languageName={learningLanguageName} onSelectedChange={setPartsOfSpeech}>
        <VocabularyCategoryFields categories={availableCategories} selected={selectedCategories} onSelectedChange={setSelectedCategories} />
      </WordMetadataFields>
      <AdvancedWordFields synonyms={synonyms} onSynonymsChange={setSynonyms} commonPhrases={commonPhrases} onCommonPhrasesChange={setCommonPhrases} />
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <strong className="text-sm">{t("add.sentences")}<RequiredMark /> <span className="font-normal text-[var(--muted)]">{t("add.minimum")}</span></strong>
          {sentences.length < 4 ? <button type="button" className="text-button" onClick={() => setSentences((current) => [...current, { sentence: "", explanation: "" }])}>{t("add.addSentence")}</button> : null}
        </div>
        {sentences.map(({ sentence, explanation }, index) => (
          <div key={index} className="rounded-lg border border-[var(--line)] bg-[#fbfcff] p-3">
            <textarea className="field min-h-20 resize-y" required={index < 2} value={sentence} onChange={(event) => updateSentence(index, "sentence", event.target.value)} placeholder={t("add.sentence", { number: index + 1 })} aria-label={t("add.sentence", { number: index + 1 })} />
            <ExampleGapPreview sentence={sentence} word={word} />
            <label className="mt-3 block text-sm font-bold">
              {t("add.sentenceExplanation", { number: index + 1, language: explanationLanguageName })}
              <input className="field mt-2" value={explanation} onChange={(event) => updateSentence(index, "explanation", event.target.value)} placeholder={t("add.sentenceExplanation", { number: index + 1, language: explanationLanguageName })} />
            </label>
          </div>
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
