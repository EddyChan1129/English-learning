"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { AppNavigation } from "@/components/AppNavigation";
import { AuthForm } from "@/components/AuthForm";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { addWord, loadTarget, recordTestResult, saveTarget, subscribeToWords } from "@/lib/firestore";
import { toLocalDate } from "@/lib/date";
import type { NewWord, UserTarget, WordDocument } from "@/types";

type AppContextValue = {
  user: User;
  target: UserTarget | null;
  targetLoaded: boolean;
  words: WordDocument[];
  wordsLoaded: boolean;
  dueWords: WordDocument[];
  saveLearningTarget: (target: UserTarget) => Promise<void>;
  createWord: (word: NewWord) => Promise<void>;
  saveTestResult: (word: WordDocument, passed: boolean) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!auth);
  const [target, setTarget] = useState<UserTarget | null>(null);
  const [targetLoaded, setTargetLoaded] = useState(false);
  const [words, setWords] = useState<WordDocument[]>([]);
  const [wordsLoaded, setWordsLoaded] = useState(false);
  const [error, setError] = useState("");

  function showError(cause: unknown) {
    setError(cause instanceof Error ? cause.message : "Something went wrong. Refresh and try again.");
  }

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setTarget(null);
        setTargetLoaded(false);
        setWords([]);
        setWordsLoaded(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadTarget(user.uid)
      .then(setTarget)
      .catch(showError)
      .finally(() => setTargetLoaded(true));
    return subscribeToWords(
      user.uid,
      (nextWords) => {
        setWords(nextWords);
        setWordsLoaded(true);
      },
      showError,
    );
  }, [user]);

  const dueWords = useMemo(
    () => words.filter((word) => word.status === "learning" && word.nextTestDate <= toLocalDate()),
    [words],
  );

  async function saveLearningTarget(nextTarget: UserTarget) {
    if (!user) return;
    await saveTarget(user.uid, nextTarget);
    setTarget(nextTarget);
  }

  async function createWord(word: NewWord) {
    if (!user) return;
    await addWord(user.uid, word);
  }

  async function saveTestResult(word: WordDocument, passed: boolean) {
    if (!user) return;
    await recordTestResult(user.uid, word.id, passed);
  }

  if (!isFirebaseConfigured) return <ConfigurationHelp />;
  if (!authReady) return <FullPageLoading />;
  if (!user) return <AuthForm />;

  return (
    <AppContext.Provider value={{
      user,
      target,
      targetLoaded,
      words,
      wordsLoaded,
      dueWords,
      saveLearningTarget,
      createWord,
      saveTestResult,
    }}>
      <AppNavigation user={user} />
      <main className="app-content">
        {error ? <ErrorNotice message={error} onDismiss={() => setError("")} /> : null}
        {children}
      </main>
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider.");
  return value;
}

function FullPageLoading() {
  return <main className="grid min-h-screen place-items-center"><p className="font-display text-2xl">Opening your wordbook…</p></main>;
}

function ErrorNotice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mb-5 flex justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      <span>{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}

function ConfigurationHelp() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="card max-w-2xl p-8 sm:p-10">
        <p className="eyebrow">One-time setup</p>
        <h1 className="page-title mt-2">Connect your Firebase project</h1>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--muted)]">
          <li>Create a Firebase web app and enable Email/Password in Authentication.</li>
          <li>Create a Firestore database and deploy the included <code>firestore.rules</code>.</li>
          <li>Copy <code>.env.example</code> to <code>.env.local</code>, then fill in the six public Firebase values.</li>
          <li>Restart <code>npm run dev</code>.</li>
        </ol>
      </section>
    </main>
  );
}
