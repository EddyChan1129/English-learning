"use client";

import { useState } from "react";
import type { NewWord } from "@/types";
import { SpeechButton } from "./SpeechButton";

export function AddWordForm({ onAdd }: { onAdd: (word: NewWord) => Promise<void> }) {
  const [word, setWord] = useState("");
  const [chineseMeaning, setChineseMeaning] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [sentences, setSentences] = useState(["", ""]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateSentence(index: number, value: string) {
    setSentences((current) => current.map((sentence, i) => i === index ? value : sentence));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleanSentences = sentences.map((sentence) => sentence.trim()).filter(Boolean);
    if (cleanSentences.length < 2) return setError("Please add at least two example sentences.");
    if (!cleanSentences.some((sentence) => sentence.toLowerCase().includes(word.trim().toLowerCase()))) return setError("Use the target word in at least one sentence so gap-fill tests can work.");
    setBusy(true);
    setError("");
    try {
      await onAdd({
        word: word.trim(),
        chineseMeaning: chineseMeaning.trim(),
        synonyms: synonyms.split(",").map((item) => item.trim()).filter(Boolean),
        sentences: cleanSentences,
      });
      setWord(""); setChineseMeaning(""); setSynonyms(""); setSentences(["", ""]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this word.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card rounded-[2rem] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--orange)]">Grow your collection</p><h2 className="font-display mt-1 text-3xl font-semibold">Add a new word</h2></div>
        {word.trim() && <SpeechButton text={word} />}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Target word<input className="field mt-2" required value={word} onChange={(e) => setWord(e.target.value)} placeholder="serendipity" /></label>
        <label className="text-sm font-bold">Chinese meaning<input className="field mt-2" required value={chineseMeaning} onChange={(e) => setChineseMeaning(e.target.value)} placeholder="意外發現美好事物的運氣" /></label>
      </div>
      <label className="mt-4 block text-sm font-bold">Synonyms <span className="font-normal text-black/40">(comma separated)</span><input className="field mt-2" value={synonyms} onChange={(e) => setSynonyms(e.target.value)} placeholder="chance, discovery" /></label>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between"><strong className="text-sm">Example sentences <span className="font-normal text-black/40">(minimum 2)</span></strong><button type="button" className="text-sm font-bold text-[var(--green)]" onClick={() => setSentences((current) => [...current, ""])}>+ Add sentence</button></div>
        {sentences.map((sentence, index) => <div key={index} className="flex gap-2"><textarea className="field min-h-20 resize-y" required={index < 2} value={sentence} onChange={(e) => updateSentence(index, e.target.value)} placeholder={`Sentence ${index + 1}`} />{sentence && <SpeechButton text={sentence} label="" />}</div>)}
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="btn-primary mt-6" disabled={busy}>{busy ? "Saving…" : "Add to vocabulary"}</button>
    </form>
  );
}
