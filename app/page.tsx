"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { AuthForm } from "@/components/AuthForm";
import { AddWordForm } from "@/components/AddWordForm";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { TargetForm } from "@/components/TargetForm";
import { TestSession } from "@/components/TestSession";
import { WordList } from "@/components/WordList";
import { addWord, loadTarget, recordTestResult, saveTarget, subscribeToWords } from "@/lib/firestore";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { toLocalDate } from "@/lib/date";
import type { NewWord, UserTarget, WordDocument } from "@/types";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!auth);
  const [target, setTarget] = useState<UserTarget | null>(null);
  const [targetLoaded, setTargetLoaded] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [words, setWords] = useState<WordDocument[]>([]);
  const [error, setError] = useState("");

  function showError(cause: unknown) {
    setError(cause instanceof Error ? cause.message : "Something went wrong.");
  }

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setWords([]);
        setTarget(null);
        setTargetLoaded(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadTarget(user.uid).then(setTarget).catch(showError).finally(() => setTargetLoaded(true));
    return subscribeToWords(user.uid, setWords);
  }, [user]);

  const dueWords = useMemo(() => words.filter((word) => word.status === "learning" && word.nextTestDate <= toLocalDate()), [words]);

  async function handleTarget(nextTarget: UserTarget) {
    if (!user) return;
    await saveTarget(user.uid, nextTarget);
    setTarget(nextTarget);
    setEditingTarget(false);
  }

  async function handleAdd(input: NewWord) {
    if (!user) return;
    await addWord(user.uid, input);
  }

  async function handleResult(word: WordDocument, passed: boolean) {
    if (!user) return;
    await recordTestResult(user.uid, word.id, passed);
  }

  if (!isFirebaseConfigured) return <ConfigurationHelp />;
  if (!authReady) return <main className="grid min-h-screen place-items-center"><p className="font-display text-2xl">Opening your wordbook…</p></main>;
  if (!user) return <AuthForm />;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 sm:px-7">
      <header className="flex items-center justify-between py-6 sm:py-8">
        <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-[var(--ink)] font-display text-lg text-white">W</div><span className="font-display text-2xl font-semibold">Wordwise</span></div>
        <div className="flex items-center gap-3"><span className="hidden max-w-52 truncate text-sm text-black/45 sm:block">{user.email}</span>{target && <button className="btn-secondary text-sm" onClick={() => setEditingTarget((value) => !value)}>Edit target</button>}<button className="text-sm font-bold text-black/50" onClick={() => auth && signOut(auth)}>Sign out</button></div>
      </header>

      {error && <div className="mb-5 flex justify-between rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss">×</button></div>}

      {!targetLoaded ? <p className="py-20 text-center">Loading your progress…</p> : !target || editingTarget ? <div className="mx-auto mt-12 max-w-2xl"><TargetForm initial={target} onSave={handleTarget} /></div> : <div className="space-y-6 animate-rise">
        <ProgressDashboard target={target} words={words} />
        <div className="grid items-start gap-6 xl:grid-cols-[1fr_.82fr]">
          <div className="space-y-6"><TestSession key={dueWords[0]?.id ?? "empty"} words={dueWords} onResult={handleResult} /><WordList words={words} /></div>
          <AddWordForm onAdd={handleAdd} />
        </div>
      </div>}
    </main>
  );
}

function ConfigurationHelp() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="card max-w-2xl rounded-[2rem] p-8 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--orange)]">One-time setup</p>
        <h1 className="font-display mt-2 text-4xl font-semibold">Connect your Firebase project</h1>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-6 text-black/65">
          <li>Create a Firebase web app and enable Email/Password in Authentication.</li>
          <li>Create a Firestore database and deploy the included <code>firestore.rules</code>.</li>
          <li>Copy <code>.env.example</code> to <code>.env.local</code>, then fill in the six public Firebase values.</li>
          <li>Restart <code>npm run dev</code>.</li>
        </ol>
      </section>
    </main>
  );
}
