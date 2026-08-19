"use client";

import { useMemo, useRef, useState } from "react";
import { isSynonymAnswerCorrect, isWordAnswerCorrect, makeGapSentence, randomMode } from "@/lib/test-helpers";
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

export function TestSession({ words, onResult }: { words: WordDocument[]; onResult: (word: WordDocument, passed: boolean) => Promise<void> }) {
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
    const source = current.sentences.find((sentence) => sentence.toLowerCase().includes(current.word.toLowerCase())) ?? current.sentences[0];
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
    const SpeechRecognition = (window as typeof window & { webkitSpeechRecognition?: RecognitionConstructor; SpeechRecognition?: RecognitionConstructor }).SpeechRecognition
      ?? (window as typeof window & { webkitSpeechRecognition?: RecognitionConstructor }).webkitSpeechRecognition;
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
      <section className="card rounded-[2rem] p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--sage)] text-3xl">✓</div>
        <h2 className="font-display mt-4 text-3xl font-semibold">Reviews complete</h2>
        <p className="mt-2 text-sm text-black/55">Nothing else is due today. Nicely done.</p>
      </section>
    );
  }

  const labels: Record<TestMode, string> = { pronunciation: "Pronunciation", synonym: "Synonym", "gap-fill": "Gap fill" };

  return (
    <section className="overflow-hidden rounded-[2rem] bg-[#dcebd7] shadow-[0_18px_45px_rgba(31,48,39,.08)]">
      <div className="flex items-center justify-between border-b border-black/8 px-6 py-4">
        <div><span className="text-xs font-bold uppercase tracking-[.18em] text-[var(--green)]">Today’s review</span><span className="ml-3 text-xs text-black/45">{words.length} remaining</span></div>
        {mode && <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">{labels[mode]}</span>}
      </div>
      <div className="p-6 sm:p-9">
        {mode === "pronunciation" && <>
          <p className="text-sm font-bold text-black/50">Say this word aloud</p>
          <div className="mt-3 flex items-center gap-3"><h2 className="font-display text-5xl font-semibold">{current.word}</h2><SpeechButton text={current.word} label="Hear it" /></div>
          <p className="mt-2 text-lg">{current.chineseMeaning}</p>
          {!speechUnavailable
            ? <button type="button" onClick={startListening} disabled={listening || outcome !== null} className="btn-primary mt-8">{listening ? "Listening…" : "● Start speaking"}</button>
            : <div className="mt-7"><p className="mb-2 text-sm text-black/55">Voice recognition is unavailable in this browser. Type what you said:</p><AnswerForm answer={answer} setAnswer={setAnswer} onCheck={check} disabled={outcome !== null} /></div>}
          {answer && <p className="mt-4 text-sm">We heard: <strong>“{answer}”</strong></p>}
        </>}

        {mode === "synonym" && <>
          <p className="text-sm font-bold text-black/50">Type one English synonym for</p>
          <h2 className="font-display mt-3 text-4xl font-semibold">{current.word}</h2>
          <p className="mt-1 text-lg">{current.chineseMeaning}</p>
          <div className="mt-7"><AnswerForm answer={answer} setAnswer={setAnswer} onCheck={check} disabled={outcome !== null} /></div>
        </>}

        {mode === "gap-fill" && <>
          <p className="text-sm font-bold text-black/50">Complete the sentence</p>
          <blockquote className="font-display mt-4 text-2xl font-medium leading-relaxed sm:text-3xl">“{gapSentence}”</blockquote>
          <p className="mt-3 text-sm text-black/50">Hint: {current.chineseMeaning}</p>
          <div className="mt-7"><AnswerForm answer={answer} setAnswer={setAnswer} onCheck={check} disabled={outcome !== null} /></div>
        </>}

        {outcome !== null && <div className={`mt-6 rounded-2xl p-4 ${outcome ? "bg-white/65 text-[var(--green)]" : "bg-[#fff4ee] text-[#9b3e1c]"}`} role="status">
          <strong>{outcome ? "Correct — nice work." : `Not quite. The answer is “${current.word}”.`}</strong>
          {!outcome && mode === "synonym" && <p className="mt-1 text-sm">Accepted: {current.synonyms.join(", ")}</p>}
          <button className="btn-primary mt-3" onClick={continueTest} disabled={busy}>{busy ? "Saving…" : "Continue →"}</button>
        </div>}
      </div>
    </section>
  );
}

function AnswerForm({ answer, setAnswer, onCheck, disabled }: { answer: string; setAnswer: (value: string) => void; onCheck: () => void; disabled: boolean }) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); onCheck(); }}>
      <input className="field flex-1" value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={disabled} autoFocus placeholder="Type your answer…" required />
      <button className="btn-primary" disabled={disabled}>Check answer</button>
    </form>
  );
}
