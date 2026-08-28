"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { parsePastedExamples } from "@/lib/example-paste";
import { isDuplicateVocabularyError } from "@/lib/vocabulary";
import { getLanguageName } from "@/lib/languages";
import { useApp } from "@/components/AppProvider";
import type { NewWord, PartOfSpeech } from "@/types";
import { ChineseMeaningFields } from "./ChineseMeaningFields";
import { SpeechButton } from "./SpeechButton";
import { VocabularyCategoryFields } from "./VocabularyCategoryFields";
import { AdvancedWordFields, RequiredMark, WordMetadataFields } from "./WordMetadataFields";

const EMPTY_SENTENCES = () => Array.from({ length: 2 }, () => ({ sentence: "", explanation: "" }));

export function AddWordForm({ onAdd, categories }: {
  onAdd: (word: NewWord) => Promise<void>;
  categories: string[];
}) {
  const [word, setWord] = useState("");
  const [chineseMeanings, setChineseMeanings] = useState([""]);
  const [synonyms, setSynonyms] = useState("");
  const [partsOfSpeech, setPartsOfSpeech] = useState<PartOfSpeech[]>([]);
  const [commonPhrases, setCommonPhrases] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sentences, setSentences] = useState(EMPTY_SENTENCES);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pasteMessage, setPasteMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  const { languagePreferences } = useApp();
  const { i18n, t } = useTranslation();
  const learningLanguageName = getLanguageName(languagePreferences.learningLanguage, i18n.resolvedLanguage);
  const explanationLanguageName = getLanguageName(languagePreferences.explanationLanguage, i18n.resolvedLanguage);

  function updateSentence(index: number, field: "sentence" | "explanation", value: string) {
    setSentences((current) => current.map((entry, i) => i === index ? { ...entry, [field]: value } : entry));
  }

  function pasteExamples(index: number, event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const examples = parsePastedExamples(event.clipboardData.getData("text")).slice(0, 4 - index);
    if (!examples.length) return;
    event.preventDefault();
    setSentences((current) => {
      const next = [...current];
      while (next.length < index + examples.length) next.push({ sentence: "", explanation: "" });
      examples.forEach((example, offset) => { next[index + offset] = example; });
      return next;
    });
    setPasteMessage(t("add.pastedExamples", { count: examples.length }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSuccess("");
    const cleanSynonyms = synonyms.split(",").map((item) => item.trim()).filter(Boolean);
    const cleanChineseMeanings = chineseMeanings.map((item) => item.trim()).filter(Boolean);
    const cleanSentences = sentences
      .map(({ sentence, explanation }) => ({ sentence: sentence.trim(), explanation: explanation.trim() }))
      .filter(({ sentence }) => sentence);
    if (!cleanChineseMeanings.length) return setError(t("add.chineseMeaningError", { language: explanationLanguageName }));
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
      const savedWord = word.trim();
      await onAdd({
        word: savedWord,
        chineseMeaning: cleanChineseMeanings[0],
        chineseMeanings: cleanChineseMeanings,
        synonyms: cleanSynonyms,
        sentences: cleanSentences.map(({ sentence }) => sentence),
        sentenceExplanations: cleanSentences.map(({ explanation }) => explanation),
        partsOfSpeech,
        commonPhrases: commonPhrases.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
        categories: selectedCategories,
      });
      setWord("");
      setChineseMeanings([""]);
      setSynonyms("");
      setPartsOfSpeech([]);
      setCommonPhrases("");
      setSelectedCategories([]);
      setSentences(EMPTY_SENTENCES());
      setPasteMessage("");
      setSuccess(t("add.addedToast", { word: savedWord }));
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      wordInputRef.current?.focus({ preventScroll: true });
    } catch (saveError) {
      setError(isDuplicateVocabularyError(saveError)
        ? t("add.duplicateError", { word: word.trim() })
        : t("add.saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="card word-form scroll-mt-24 p-6 sm:p-8" aria-busy={busy}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{t("add.eyebrow")}</p>
          <h2 className="font-display mt-1 text-3xl font-semibold">{t("add.title")}</h2>
        </div>
        {word.trim() ? <SpeechButton text={word} /> : null}
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">
          {t("add.targetWord", { language: learningLanguageName })}
          <RequiredMark />
          <input
            ref={wordInputRef}
            className="field mt-4"
            required
            value={word}
            onChange={(event) => setWord(event.target.value)}
            placeholder={t("add.targetPlaceholder", { language: learningLanguageName })}
          />
        </label>
        <ChineseMeaningFields values={chineseMeanings} languageName={explanationLanguageName} onChange={setChineseMeanings} />
      </div>
      <WordMetadataFields selected={partsOfSpeech} languageName={learningLanguageName} onSelectedChange={setPartsOfSpeech}>
        <VocabularyCategoryFields categories={categories} selected={selectedCategories} onSelectedChange={setSelectedCategories} />
      </WordMetadataFields>
      <AdvancedWordFields synonyms={synonyms} onSynonymsChange={setSynonyms} commonPhrases={commonPhrases} onCommonPhrasesChange={setCommonPhrases} />
      <div className="mt-4 space-y-3">
        <div className="sentence-fields-heading flex items-center justify-between">
          <strong className="text-sm">{t("add.sentences")}<RequiredMark /> <span className="font-normal text-[var(--muted)]">{t("add.minimum")}</span></strong>
          {sentences.length < 4 ? <button type="button" className="text-button" onClick={() => setSentences((current) => [...current, { sentence: "", explanation: "" }])}>{t("add.addSentence")}</button> : null}
        </div>
        <p className="-mt-1 text-xs leading-5 text-[var(--muted)]">{t("add.pasteExamplesHint")}</p>
        <span className="sr-only" role="status" aria-live="polite">{pasteMessage}</span>
        {sentences.map(({ sentence, explanation }, index) => (
          <div key={index} className="rounded-lg border border-[var(--line)] bg-[#fbfcff] p-3">
            <div className="flex gap-2">
              <textarea
                className="field min-h-20 resize-y"
                required={index < 2}
                value={sentence}
                onChange={(event) => updateSentence(index, "sentence", event.target.value)}
                onPaste={(event) => pasteExamples(index, event)}
                placeholder={t("add.sentence", { number: index + 1 })}
                aria-label={t("add.sentence", { number: index + 1 })}
              />
              {sentence ? <SpeechButton text={sentence} label="" /> : null}
            </div>
            <label className="mt-3 block text-sm font-bold">
              {t("add.sentenceExplanation", { number: index + 1, language: explanationLanguageName })}
              <input
                className="field mt-2"
                value={explanation}
                onChange={(event) => updateSentence(index, "explanation", event.target.value)}
                placeholder={t("add.sentenceExplanation", { number: index + 1, language: explanationLanguageName })}
              />
            </label>
          </div>
        ))}
      </div>
      {error ? (
        <div role="alert" className="essential-toast error">
          <span>{error}</span>
          <button type="button" className="border-0 bg-transparent text-lg" onClick={() => setError("")} aria-label={t("common.dismiss")}>×</button>
        </div>
      ) : null}
      {success ? (
        <div role="status" className="essential-toast success">
          <span>{success}</span>
          <button type="button" className="border-0 bg-transparent text-lg" onClick={() => setSuccess("")} aria-label={t("common.dismiss")}>×</button>
        </div>
      ) : null}
      <button className="btn-primary mt-6" disabled={busy}>{busy ? t("common.saving") : t("add.save")}</button>
    </form>
  );
}
