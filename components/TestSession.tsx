"use client";

import { useMemo, useRef, useState } from "react";
import {
  isSynonymAnswerCorrect,
  isWordAnswerCorrect,
  makeGapSentence,
  randomMode,
} from "@/lib/test-helpers";
import type { TestMode, WordDocument } from "@/types";
import { SpeechButton } from "./SpeechButton";

type RecognitionResult = { 0: { transcript: string } };
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: (event: { results: RecognitionResult[] }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
};

type RecognitionConstructor = new () => Recognition;
type SpeechWindow = typeof window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

type TestSessionProps = {
  words: WordDocument[];
  onResult: (word: WordDocument, passed: boolean) => Promise<void>;
};

const MODE_LABELS: Record<TestMode, string> = {
  pronunciation: "Pronunciation",
  synonym: "Synonym",
  "gap-fill": "Gap fill",
};

export function TestSession({ words, onResult }: TestSessionProps) {
  const current = words[0];
  const [mode] = useState<TestMode | null>(() => current ? randomMode(current) : null);
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [speechUnavailable, setSpeechUnavailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);

  const gapSentence = useMemo(() => {
    if (!current) return "";
    const source = current.sentences.find((sentence) =>
      sentence.toLowerCase().includes(current.word.toLowerCase()),
    ) ?? current.sentences[0];
    return makeGapSentence(source, current.word);
  }, [current]);

  function check(value = answer) {
    if (!current || !mode) return;
    const passed = mode === "synonym"
      ? isSynonymAnswerCorrect(value, current.synonyms)
      : isWordAnswerCorrect(value, current.word);
    setOutcome(passed);
  }

  function startListening() {
    if (!current) return;
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechUnavailable(true);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
      check(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  async function continueTest() {
    if (!current || outcome === null) return;
    setBusy(true);
    try {
      await onResult(current, outcome);
    } finally {
      setBusy(false);
    }
  }

  if (!current) {
    return (
      <section className="card p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center border border-[var(--green)] bg-[var(--mint)] text-3xl text-[var(--green)]">
          ✓
        </div>
        <h2 className="font-display mt-4 text-3xl font-semibold">Reviews complete</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Nothing else is due today. Nicely done.</p>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[#f1effb] px-6 py-4">
        <div>
          <span className="eyebrow">Today’s review</span>
          <span className="ml-3 text-xs text-[var(--muted)]">{words.length} remaining</span>
        </div>
        {mode ? <span className="stage-badge">{MODE_LABELS[mode]}</span> : null}
      </div>
      <div className="p-6 sm:p-9">
        {mode === "pronunciation" ? (
          <PronunciationPrompt
            word={current}
            answer={answer}
            listening={listening}
            speechUnavailable={speechUnavailable}
            finished={outcome !== null}
            onAnswer={setAnswer}
            onCheck={check}
            onListen={startListening}
          />
        ) : null}

        {mode === "synonym" ? (
          <SynonymPrompt word={current} answer={answer} finished={outcome !== null} onAnswer={setAnswer} onCheck={check} />
        ) : null}

        {mode === "gap-fill" ? (
          <GapFillPrompt word={current} sentence={gapSentence} answer={answer} finished={outcome !== null} onAnswer={setAnswer} onCheck={check} />
        ) : null}

        {outcome !== null ? (
          <TestFeedback
            word={current}
            mode={mode}
            passed={outcome}
            busy={busy}
            onContinue={continueTest}
          />
        ) : null}
      </div>
    </section>
  );
}

type AnswerFormProps = {
  answer: string;
  setAnswer: (value: string) => void;
  onCheck: () => void;
  disabled: boolean;
};

function AnswerForm({ answer, setAnswer, onCheck, disabled }: AnswerFormProps) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => {
      event.preventDefault();
      onCheck();
    }}>
      <input
        className="field flex-1"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        disabled={disabled}
        autoFocus
        placeholder="Type your answer…"
        required
      />
      <button className="btn-primary" disabled={disabled}>Check answer</button>
    </form>
  );
}

type PromptProps = {
  word: WordDocument;
  answer: string;
  finished: boolean;
  onAnswer: (answer: string) => void;
  onCheck: () => void;
};

function PronunciationPrompt({ word, answer, listening, speechUnavailable, finished, onAnswer, onCheck, onListen }: PromptProps & {
  listening: boolean;
  speechUnavailable: boolean;
  onListen: () => void;
}) {
  return <>
    <p className="text-sm font-bold text-[var(--muted)]">Say this word aloud</p>
    <div className="mt-3 flex items-center gap-3">
      <h2 className="font-display text-5xl font-semibold">{word.word}</h2>
      <SpeechButton text={word.word} label="Hear it" />
    </div>
    <p className="mt-2 text-lg">{word.chineseMeaning}</p>
    {speechUnavailable ? (
      <div className="mt-7">
        <p className="mb-2 text-sm text-[var(--muted)]">Voice recognition is unavailable in this browser. Type what you said:</p>
        <AnswerForm answer={answer} setAnswer={onAnswer} onCheck={onCheck} disabled={finished} />
      </div>
    ) : (
      <button type="button" onClick={onListen} disabled={listening || finished} className="btn-primary mt-8">
        {listening ? "Listening…" : "● Start speaking"}
      </button>
    )}
    {answer ? <p className="mt-4 text-sm">We heard: <strong>“{answer}”</strong></p> : null}
  </>;
}

function SynonymPrompt({ word, answer, finished, onAnswer, onCheck }: PromptProps) {
  return <>
    <p className="text-sm font-bold text-[var(--muted)]">Type one English synonym for</p>
    <h2 className="font-display mt-3 text-4xl font-semibold">{word.word}</h2>
    <p className="mt-1 text-lg">{word.chineseMeaning}</p>
    <div className="mt-7"><AnswerForm answer={answer} setAnswer={onAnswer} onCheck={onCheck} disabled={finished} /></div>
  </>;
}

function GapFillPrompt({ word, sentence, answer, finished, onAnswer, onCheck }: PromptProps & { sentence: string }) {
  return <>
    <p className="text-sm font-bold text-[var(--muted)]">Complete the sentence</p>
    <blockquote className="font-display mt-4 text-2xl font-medium leading-relaxed sm:text-3xl">“{sentence}”</blockquote>
    <p className="mt-3 text-sm text-[var(--muted)]">Hint: {word.chineseMeaning}</p>
    <div className="mt-7"><AnswerForm answer={answer} setAnswer={onAnswer} onCheck={onCheck} disabled={finished} /></div>
  </>;
}

function TestFeedback({ word, mode, passed, busy, onContinue }: {
  word: WordDocument;
  mode: TestMode | null;
  passed: boolean;
  busy: boolean;
  onContinue: () => void;
}) {
  const colors = passed
    ? "border-[#8ed5b9] bg-[#effaf5] text-[var(--green)]"
    : "border-red-200 bg-red-50 text-red-700";

  return <div className={`mt-6 border p-4 ${colors}`} role="status">
    <strong>{passed ? "Correct — nice work." : `Not quite. The answer is “${word.word}”.`}</strong>
    {!passed && mode === "synonym" ? <p className="mt-1 text-sm">Accepted: {word.synonyms.join(", ")}</p> : null}
    <button className="btn-primary mt-3" onClick={onContinue} disabled={busy}>{busy ? "Saving…" : "Continue →"}</button>
  </div>;
}
