"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { isDuplicateVocabularyError, normalizeVocabularyKey } from "@/lib/vocabulary";
import { normalizeNewsSelection, sentenceAtOffset } from "@/lib/news";
import { PARTS_OF_SPEECH, type NewsDocument, type PartOfSpeech } from "@/types";

type ArticleSelection = {
  text: string;
  sentence: string;
  x: number;
  y: number;
  above: boolean;
};

export function NewsReader({ article }: { article: NewsDocument }) {
  const { createWord, words, wordsLoaded } = useApp();
  const { t } = useTranslation();
  const [selection, setSelection] = useState<ArticleSelection | null>(null);
  const [meaning, setMeaning] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech | "">("");
  const [example, setExample] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showChinese, setShowChinese] = useState(true);
  const [notice, setNotice] = useState<{ word: string; wordId: string } | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const existingWord = useMemo(() => {
    if (!selection) return null;
    const key = normalizeVocabularyKey(selection.text);
    return words.find((word) => normalizeVocabularyKey(word.word) === key) ?? null;
  }, [selection, words]);

  useEffect(() => {
    if (!selection) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelection(null);
    }
    function closeOutside(event: PointerEvent) {
      if (captureRef.current?.contains(event.target as Node)) return;
      const target = event.target as Element | null;
      if (target?.closest("[data-news-paragraph]")) return;
      setSelection(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOutside);
    };
  }, [selection]);

  function captureSelection() {
    const browserSelection = window.getSelection();
    if (!browserSelection || browserSelection.isCollapsed || browserSelection.rangeCount === 0) return;
    const range = browserSelection.getRangeAt(0);
    const startElement = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer as Element
      : range.startContainer.parentElement;
    const endElement = range.endContainer.nodeType === Node.ELEMENT_NODE
      ? range.endContainer as Element
      : range.endContainer.parentElement;
    const paragraph = startElement?.closest<HTMLElement>("[data-news-paragraph]");
    if (!paragraph || paragraph !== endElement?.closest("[data-news-paragraph]")) return;

    const text = normalizeNewsSelection(browserSelection.toString());
    if (!text || text.length > 120) return;
    const paragraphText = paragraph.textContent ?? "";
    const beforeSelection = range.cloneRange();
    beforeSelection.selectNodeContents(paragraph);
    beforeSelection.setEnd(range.startContainer, range.startOffset);
    const sentence = sentenceAtOffset(paragraphText, beforeSelection.toString().length);
    const rect = range.getBoundingClientRect();
    const above = rect.bottom > window.innerHeight * 0.58;
    const x = Math.max(210, Math.min(rect.left + rect.width / 2, window.innerWidth - 210));
    const y = above ? rect.top - 12 : rect.bottom + 12;

    setSelection({ text, sentence, x, y, above });
    setMeaning("");
    setPartOfSpeech("");
    setExample(sentence);
    setError("");
  }

  async function saveSelection(event: React.FormEvent) {
    event.preventDefault();
    if (!selection || existingWord || !wordsLoaded) return;
    const cleanMeaning = meaning.trim();
    const cleanExample = example.trim();
    if (!partOfSpeech || !cleanMeaning || !cleanExample) return setError(t("news.completeFields"));
    if (!normalizeVocabularyKey(cleanExample).includes(normalizeVocabularyKey(selection.text))) {
      return setError(t("news.exampleNeedsWord"));
    }

    setBusy(true);
    setError("");
    try {
      const wordId = await createWord({
        word: selection.text,
        chineseMeaning: cleanMeaning,
        chineseMeanings: [cleanMeaning],
        synonyms: [],
        sentences: [cleanExample],
        sentenceExplanations: [""],
        partsOfSpeech: [partOfSpeech],
        commonPhrases: [],
        categories: [],
      });
      setNotice({ word: selection.text, wordId });
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    } catch (saveError) {
      setError(isDuplicateVocabularyError(saveError) ? t("news.duplicate") : t("news.saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="news-reader animate-rise">
      <Link href="/news" className="news-back-link">← {t("news.backToArchive")}</Link>
      <header className="news-edition-header">
        <div className="news-date-stamp">
          <span>{article.date.slice(0, 4)}</span>
          <strong>{article.date.slice(5)}</strong>
        </div>
        <div>
          <p className="eyebrow">{t("news.dailyEdition")}</p>
          <h1>{t("news.editionTitle")}</h1>
          <p>{t("news.storyCount", { count: article.articles.length })}</p>
        </div>
        <button
          type="button"
          className="news-translation-toggle"
          aria-pressed={showChinese}
          onClick={() => setShowChinese((visible) => !visible)}
        >
          <span aria-hidden="true">中</span>
          {showChinese ? t("news.hideChinese") : t("news.showChinese")}
        </button>
      </header>

      <aside className="news-selection-guide" id="news-selection-guide">
        <span aria-hidden="true">Aa</span>
        <p><strong>{t("news.selectTitle")}</strong>{t("news.selectHint")}</p>
      </aside>

      <div className="news-story-list">
        {article.articles.map((story, storyIndex) => (
          <article className="news-story" key={`${story.sourceUrl}-${storyIndex}`}>
            <header className="news-story-header">
              <p className="eyebrow">{t("news.storyLabel", { number: storyIndex + 1 })}</p>
              <h2>{story.title}</h2>
              <p className="news-story-summary">{story.summary}</p>
              {showChinese && story.chineseMeaning ? (
                <p className="news-chinese-summary" lang="zh-HK">
                  <span>{t("news.chineseExplanation")}</span>
                  {story.chineseMeaning}
                </p>
              ) : null}
            </header>

            <div
              className="news-article-body"
              aria-describedby="news-selection-guide"
              onMouseUp={() => window.setTimeout(captureSelection)}
              onKeyUp={captureSelection}
              onTouchEnd={() => window.setTimeout(captureSelection, 50)}
            >
              {story.paragraphs.map((paragraph, paragraphIndex) => (
                <div className="news-paragraph-pair" key={paragraphIndex}>
                  <p data-news-paragraph tabIndex={0}>{paragraph.english}</p>
                  {showChinese && paragraph.chinese ? <p className="news-chinese-paragraph" lang="zh-HK">{paragraph.chinese}</p> : null}
                </div>
              ))}
            </div>

            <footer className="news-source-line">
              <span>{t("news.source")}</span>
              <a href={story.sourceUrl} target="_blank" rel="noreferrer">{story.sourceName} ↗</a>
            </footer>
          </article>
        ))}
      </div>

      {selection ? (
        <div
          ref={captureRef}
          className={`news-capture ${selection.above ? "above" : "below"}`}
          style={{ left: selection.x, top: selection.y }}
          role="dialog"
          aria-label={t("news.captureTitle")}
        >
          <div className="news-capture-heading">
            <div><span>{t("news.selectedLabel")}</span><strong>{selection.text}</strong></div>
            <button type="button" onClick={() => setSelection(null)} aria-label={t("common.dismiss")}>×</button>
          </div>

          {!wordsLoaded ? (
            <div className="news-duplicate-card" role="status">
              <strong>{t("news.checkingVocabulary")}</strong>
              <p>{t("news.checkingVocabularyHint")}</p>
            </div>
          ) : existingWord ? (
            <div className="news-duplicate-card" role="status">
              <strong>{t("news.alreadySaved")}</strong>
              <p>{t("news.alreadySavedHint")}</p>
              <Link href={`/history/${existingWord.id}`}>{t("news.openCard")} →</Link>
            </div>
          ) : (
            <form onSubmit={saveSelection}>
              <label>
                <span>{t("news.partOfSpeech")}</span>
                <select required value={partOfSpeech} onChange={(event) => setPartOfSpeech(event.target.value as PartOfSpeech)}>
                  <option value="">{t("news.choosePartOfSpeech")}</option>
                  {PARTS_OF_SPEECH.map((part) => <option key={part} value={part}>{t(`partsOfSpeech.${part}`)}</option>)}
                </select>
              </label>
              <label>
                <span>{t("news.chineseMeaning")}</span>
                <input required autoFocus value={meaning} onChange={(event) => setMeaning(event.target.value)} placeholder={t("news.meaningPlaceholder")} />
              </label>
              <label>
                <span>{t("news.example")}</span>
                <textarea required value={example} onChange={(event) => setExample(event.target.value)} />
              </label>
              {error ? <p className="news-capture-error" role="alert">{error}</p> : null}
              <button className="btn-primary" disabled={busy}>{busy ? t("common.saving") : t("news.saveWord")}</button>
            </form>
          )}
        </div>
      ) : null}

      {notice ? (
        <div className="essential-toast success" role="status">
          <span>{t("news.saved", { word: notice.word })}</span>
          <Link href={`/history/${notice.wordId}`}>{t("news.openCard")}</Link>
          <button type="button" onClick={() => setNotice(null)} aria-label={t("common.dismiss")}>×</button>
        </div>
      ) : null}
    </div>
  );
}
