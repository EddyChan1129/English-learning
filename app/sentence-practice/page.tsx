"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SpeechButton } from "@/components/SpeechButton";
import { StageMascot } from "@/components/StageMascot";
import { AccountRequired } from "@/components/AccountRequired";
import { useApp } from "@/components/AppProvider";
import { recordSentenceAttempt, subscribeToSentenceAttempts } from "@/lib/firestore";
import { parseSentenceEvaluation } from "@/lib/sentence-evaluation";
import { isSentencePracticeEligible, sortSentenceWords, type SentenceWordOrder } from "@/lib/sentence-practice";
import type { SentenceAttemptDocument, SentenceEvaluation, WordDocument } from "@/types";

export default function SentencePracticePage() {
  const { user, words, wordsLoaded, languagePreferences } = useApp();
  const { t } = useTranslation();
  const eligibleWords = useMemo(
    () => words.filter(isSentencePracticeEligible),
    [words],
  );
  const [attempts, setAttempts] = useState<SentenceAttemptDocument[]>([]);
  const [wordOrder, setWordOrder] = useState<SentenceWordOrder>("az");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [sentence, setSentence] = useState("");
  const [evaluation, setEvaluation] = useState<SentenceEvaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const current = currentId ? eligibleWords.find((word) => word.id === currentId) : undefined;

  useEffect(() => user ? subscribeToSentenceAttempts(user.uid, setAttempts) : undefined, [user]);

  const latestScores = useMemo(() => {
    const scores = new Map<string, number>();
    for (const attempt of attempts) {
      if (!scores.has(attempt.wordId) && Number.isFinite(attempt.score)) scores.set(attempt.wordId, attempt.score);
    }
    return scores;
  }, [attempts]);

  const sortedWords = useMemo(
    () => sortSentenceWords(eligibleWords, latestScores, wordOrder),
    [eligibleWords, latestScores, wordOrder],
  );

  async function checkSentence() {
    if (!user || !current || !sentence.trim()) return;
    setBusy(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/sentence-evaluations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetWord: current.word,
          meanings: current.chineseMeanings,
          partsOfSpeech: current.partsOfSpeech,
          sentence: sentence.trim(),
          explanationLanguage: languagePreferences.explanationLanguage,
        }),
      });
      const payload: unknown = await response.json();
      const model = payload && typeof payload === "object" && typeof (payload as { model?: unknown }).model === "string"
        ? (payload as { model: string }).model
        : undefined;
      const result = response.ok ? parseSentenceEvaluation(payload, model) : null;
      if (!result) throw new Error("evaluation-failed");

      setEvaluation(result);
      try {
        await recordSentenceAttempt(user.uid, {
          ...result,
          wordId: current.id,
          targetWord: current.word,
          sentence: sentence.trim(),
        });
      } catch {
        setError(t("sentencePractice.saveWarning"));
      }
    } catch {
      setError(t("sentencePractice.error"));
    } finally {
      setBusy(false);
    }
  }

  function selectWord(wordId: string | null) {
    setCurrentId(wordId);
    setSentence("");
    setEvaluation(null);
    setError("");
  }

  if (!user) return <AccountRequired feature="ai" />;

  return (
    <div className="mx-auto max-w-5xl animate-rise">
      <header className="mb-7 border-b border-[var(--line)] pb-5">
        <p className="eyebrow">{t("sentencePractice.eyebrow")}</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title">{t("sentencePractice.title")}</h1>
            <p className="mt-2 max-w-2xl text-[var(--muted)]">{t("sentencePractice.description")}</p>
          </div>
          <span className="count-label">{t("sentencePractice.eligibleCount", { count: eligibleWords.length })}</span>
        </div>
      </header>

      {!wordsLoaded ? (
        <p className="py-24 text-center text-sm text-[var(--muted)]">{t("sentencePractice.preparing")}</p>
      ) : current ? (
        <PracticeCard
          word={current}
          sentence={sentence}
          evaluation={evaluation}
          busy={busy}
          error={error}
          onSentenceChange={setSentence}
          onCheck={checkSentence}
          onRetry={() => {
            setEvaluation(null);
            setError("");
          }}
          onBack={() => selectWord(null)}
        />
      ) : eligibleWords.length ? (
        <WordLibrary
          words={sortedWords}
          scores={latestScores}
          order={wordOrder}
          onOrderChange={setWordOrder}
          onSelect={(word) => selectWord(word.id)}
        />
      ) : (
        <section className="card p-8 text-center">
          <StageMascot stage={0} size={96} className="mx-auto" />
          <h2 className="font-display mt-4 text-3xl font-semibold">{t("sentencePractice.emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">{t("sentencePractice.emptyDescription")}</p>
        </section>
      )}
    </div>
  );
}

function WordLibrary({ words, scores, order, onOrderChange, onSelect }: {
  words: WordDocument[];
  scores: Map<string, number>;
  order: SentenceWordOrder;
  onOrderChange: (order: SentenceWordOrder) => void;
  onSelect: (word: WordDocument) => void;
}) {
  const { t } = useTranslation();
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] bg-[#fff8dd] px-6 py-4">
        <div>
          <span className="eyebrow">{t("sentencePractice.libraryTitle")}</span>
          <p className="mt-1 text-xs text-[var(--muted)]">{t("sentencePractice.libraryHint")}</p>
        </div>
        <label className="sentence-sort">
          <span>{t("sentencePractice.sortLabel")}</span>
          <select value={order} onChange={(event) => onOrderChange(event.target.value as SentenceWordOrder)}>
            <option value="az">{t("sentencePractice.sort.az")}</option>
            <option value="za">{t("sentencePractice.sort.za")}</option>
            <option value="unpractised">{t("sentencePractice.sort.unpractised")}</option>
            <option value="scoreLow">{t("sentencePractice.sort.scoreLow")}</option>
            <option value="scoreHigh">{t("sentencePractice.sort.scoreHigh")}</option>
            <option value="testSoonest">{t("sentencePractice.sort.testSoonest")}</option>
            <option value="testLatest">{t("sentencePractice.sort.testLatest")}</option>
          </select>
        </label>
      </div>

      <div className="sentence-word-grid">
        {words.map((word) => {
          const score = scores.get(word.id);
          return (
            <article key={word.id} className="sentence-word-card-shell">
              <button
                type="button"
                className="sentence-word-card"
                onClick={() => onSelect(word)}
                aria-label={t("sentencePractice.openWord", { word: word.word })}
              >
                <span className="sentence-word-card-top">
                  <StageMascot stage={word.stage} size={48} />
                  <ScoreStamp score={score} />
                </span>
                <strong>{word.word}</strong>
                <small>{word.chineseMeanings.join(" · ")}</small>
                <span className="sentence-word-action">{t("sentencePractice.startSentence")} <b aria-hidden="true">→</b></span>
              </button>
              <SpeechButton text={word.word} language="en-US" iconOnly className="card-speech-button" />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PracticeCard({ word, sentence, evaluation, busy, error, onSentenceChange, onCheck, onRetry, onBack }: {
  word: WordDocument;
  sentence: string;
  evaluation: SentenceEvaluation | null;
  busy: boolean;
  error: string;
  onSentenceChange: (sentence: string) => void;
  onCheck: () => Promise<void>;
  onRetry: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[#fff8dd] px-6 py-4">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>← {t("sentencePractice.backToWords")}</Button>
        <div className="flex items-center gap-2">
          <span className="stage-badge">{t("common.stageName", { stage: word.stage, label: t(`stages.${word.stage}.label`) })}</span>
          <SpeechButton text={word.word} language="en-US" iconOnly />
        </div>
      </div>

      <div className="grid gap-7 p-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:p-9">
        <aside className="flex flex-col items-center border-b border-[var(--line)] pb-5 text-center sm:border-r sm:border-b-0 sm:pr-6 sm:pb-0">
          <StageMascot stage={word.stage} size={120} />
          <small className="mt-3 text-xs font-bold text-[var(--muted)]">{t("sentencePractice.ready")}</small>
        </aside>

        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--muted)]">{t("sentencePractice.useWord")}</p>
          <h2 className="font-display mt-2 break-words text-4xl font-semibold text-[var(--violet)]">{word.word}</h2>
          <WordHints word={word} />

          <form className="mt-7" onSubmit={(event) => {
            event.preventDefault();
            void onCheck();
          }}>
            <label htmlFor="learner-sentence" className="text-sm font-bold">{t("sentencePractice.yourSentence")}</label>
            <textarea
              id="learner-sentence"
              className="field mt-2 min-h-32 resize-y text-base leading-7"
              value={sentence}
              onChange={(event) => onSentenceChange(event.target.value.slice(0, 500))}
              disabled={busy || evaluation !== null}
              maxLength={500}
              autoFocus
              required
              placeholder={t("sentencePractice.placeholder", { word: word.word })}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <small className="text-[var(--muted)]">{t("sentencePractice.acceptanceHint")}</small>
              {!evaluation ? (
                <Button size="lg" disabled={busy || !sentence.trim()}>
                  {busy ? t("sentencePractice.checking") : t("sentencePractice.check")}
                </Button>
              ) : null}
            </div>
          </form>

          {error ? <p className="feedback error mt-4" role="alert">{error}</p> : null}
          {evaluation ? <EvaluationResult evaluation={evaluation} onRetry={onRetry} onChooseAnother={onBack} /> : null}
        </div>
      </div>
    </section>
  );
}

function WordHints({ word }: { word: WordDocument }) {
  const { t } = useTranslation();
  return (
    <dl className="mt-4 grid gap-2 border-l-4 border-[var(--highlight)] pl-4 text-sm">
      <div><dt className="inline font-bold">{t("sentencePractice.meaning")}: </dt><dd className="inline text-[var(--muted)]">{word.chineseMeanings.join(" · ")}</dd></div>
      {word.synonyms.length ? <div><dt className="inline font-bold">{t("sentencePractice.synonyms")}: </dt><dd className="inline text-[var(--muted)]">{word.synonyms.join(" · ")}</dd></div> : null}
    </dl>
  );
}

function EvaluationResult({ evaluation, onRetry, onChooseAnother }: {
  evaluation: SentenceEvaluation;
  onRetry: () => void;
  onChooseAnother: () => void;
}) {
  const { t } = useTranslation();
  const passed = evaluation.verdict !== "incorrect";
  return (
    <section className={`sentence-evaluation ${passed ? "passed" : "needs-work"}`} aria-live="polite">
      <div className="sentence-result-heading">
        <div>
          <p className="text-xs font-black uppercase tracking-wider">{t(`sentencePractice.verdict.${evaluation.verdict}`)}</p>
          <small>{t("sentencePractice.scoreExplanation")}</small>
        </div>
        <ScoreStamp score={evaluation.score} large />
      </div>
      <p className="mt-3 text-sm leading-6">{evaluation.feedback}</p>
      <div className="sentence-correction">
        <small className="font-bold">{t("sentencePractice.suggestedSentence")}</small>
        <p className="font-display mt-1 text-xl font-semibold">“{evaluation.correctedSentence}”</p>
        <SpeechButton text={evaluation.correctedSentence} language="en-US" label={t("sentencePractice.listen")} />
        <div className="sentence-translation">
          <small>{t("sentencePractice.sentenceMeaning")}</small>
          <p>{evaluation.translation}</p>
        </div>
      </div>
      <div className="sentence-structure">
        <small>{t("sentencePractice.sentenceBlueprint")}</small>
        <code>{evaluation.sentenceStructure}</code>
        <p>{evaluation.structureExplanation}</p>
      </div>
      <div className="sentence-learning">
        <h3>{t("sentencePractice.reusablePatterns")}</h3>
        <ol>
          {evaluation.learningPoints.map((point, index) => (
            <li key={`${point.pattern}-${index}`}>
              <span className="sentence-learning-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{t("sentencePractice.fromSentence")}: “{point.phrase}”</small>
                <p className="sentence-learning-pattern"><code>{point.pattern}</code><strong>{point.meaning}</strong></p>
                <p>{point.explanation}</p>
                <p className="sentence-learning-example"><span>{t("sentencePractice.anotherExample")}</span> “{point.example}”</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {evaluation.verdict !== "correct" ? <Button type="button" variant="outline" onClick={onRetry}>{t("sentencePractice.tryAgain")}</Button> : null}
        <Button type="button" onClick={onChooseAnother}>{t("sentencePractice.chooseAnother")}</Button>
      </div>
    </section>
  );
}

function ScoreStamp({ score, large = false }: { score?: number; large?: boolean }) {
  const { t } = useTranslation();
  const level = score === undefined ? "unscored" : score >= 9 ? "high" : score >= 7 ? "pass" : "low";
  return (
    <span className={`score-stamp ${level} ${large ? "large" : ""}`}>
      {score === undefined ? <small>{t("sentencePractice.notPractised")}</small> : <><strong>{score}</strong><small>/10</small></>}
    </span>
  );
}
