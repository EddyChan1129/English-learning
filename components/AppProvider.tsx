"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { AppNavigation } from "@/components/AppNavigation";
import { AuthForm } from "@/components/AuthForm";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import i18n from "@/lib/i18n";
import {
  addFriend,
  addWord,
  copyFriendWord,
  ensureUserProfile,
  loadTarget,
  recordTestResult,
  saveTarget,
  setWordActive,
  subscribeToFriends,
  subscribeToWords,
  updateWord,
} from "@/lib/firestore";
import { toLocalDate } from "@/lib/date";
import type { FriendDocument, NewWord, UserProfile, UserTarget, WordDocument } from "@/types";

type AppContextValue = {
  user: User;
  profile: UserProfile | null;
  profileLoaded: boolean;
  friends: FriendDocument[];
  friendsLoaded: boolean;
  target: UserTarget | null;
  targetLoaded: boolean;
  words: WordDocument[];
  wordsLoaded: boolean;
  savingWord: boolean;
  dueWords: WordDocument[];
  saveLearningTarget: (target: UserTarget) => Promise<void>;
  createWord: (word: NewWord) => Promise<void>;
  addFriendByCode: (friendCode: string) => Promise<FriendDocument>;
  copyFromFriend: (friendUid: string, word: WordDocument) => Promise<void>;
  editWord: (wordId: string, word: NewWord) => Promise<void>;
  setWordEnabled: (word: WordDocument, active: boolean) => Promise<void>;
  saveTestResult: (word: WordDocument, passed: boolean) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [friends, setFriends] = useState<FriendDocument[]>([]);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const [target, setTarget] = useState<UserTarget | null>(null);
  const [targetLoaded, setTargetLoaded] = useState(false);
  const [words, setWords] = useState<WordDocument[]>([]);
  const [wordsLoaded, setWordsLoaded] = useState(false);
  const [savingWord, setSavingWord] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!savingWord) return;
    const preventLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventLeaving);
    return () => window.removeEventListener("beforeunload", preventLeaving);
  }, [savingWord]);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setProfile(null);
        setProfileLoaded(false);
        setFriends([]);
        setFriendsLoaded(false);
        setTarget(null);
        setTargetLoaded(false);
        setWords([]);
        setWordsLoaded(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    ensureUserProfile(user.uid, user.email)
      .then(setProfile)
      .catch(() => setError(getErrorMessage()))
      .finally(() => setProfileLoaded(true));
    loadTarget(user.uid)
      .then(setTarget)
      .catch(() => setError(getErrorMessage()))
      .finally(() => setTargetLoaded(true));
    const unsubscribeWords = subscribeToWords(
      user.uid,
      (nextWords) => {
        setWords(nextWords);
        setWordsLoaded(true);
      },
      () => setError(getErrorMessage()),
    );
    const unsubscribeFriends = subscribeToFriends(
      user.uid,
      (nextFriends) => {
        setFriends(nextFriends);
        setFriendsLoaded(true);
      },
      () => setError(getErrorMessage()),
    );
    return () => {
      unsubscribeWords();
      unsubscribeFriends();
    };
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
    await protectWrite(() => addWord(user.uid, word));
  }

  async function addFriendByCode(friendCode: string) {
    if (!user) throw new Error("not-signed-in");
    return protectWrite(() => addFriend(user.uid, friendCode));
  }

  async function copyFromFriend(friendUid: string, word: WordDocument) {
    if (!user) return;
    const alreadyAdded = words.some((item) => item.word.trim().toLowerCase() === word.word.trim().toLowerCase());
    if (alreadyAdded) throw new Error("word-already-added");
    await protectWrite(() => copyFriendWord(user.uid, friendUid, word));
  }

  async function editWord(wordId: string, word: NewWord) {
    if (!user) return;
    await protectWrite(() => updateWord(user.uid, wordId, word));
  }

  async function setWordEnabled(word: WordDocument, active: boolean) {
    if (!user) return;
    await protectWrite(() => setWordActive(user.uid, word, active));
  }

  async function protectWrite<Result>(action: () => Promise<Result>) {
    setSavingWord(true);
    try {
      return await action();
    } finally {
      setSavingWord(false);
    }
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
      profile,
      profileLoaded,
      friends,
      friendsLoaded,
      target,
      targetLoaded,
      words,
      wordsLoaded,
      savingWord,
      dueWords,
      saveLearningTarget,
      createWord,
      addFriendByCode,
      copyFromFriend,
      editWord,
      setWordEnabled,
      saveTestResult,
    }}>
      <AppNavigation user={user} />
      <main className="app-content">
        {error ? <ErrorNotice message={error} onDismiss={() => setError("")} /> : null}
        {children}
      </main>
      <AppFooter />
      {savingWord ? <SaveOverlay /> : null}
    </AppContext.Provider>
  );
}

function getErrorMessage() {
  return i18n.t("app.genericError");
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider.");
  return value;
}

function FullPageLoading() {
  const { t } = useTranslation();
  return <main className="grid min-h-screen place-items-center"><p className="font-display text-2xl">{t("app.opening")}</p></main>;
}

function ErrorNotice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="mb-5 flex justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      <span>{message}</span>
      <button onClick={onDismiss} aria-label={t("common.dismiss")}>×</button>
    </div>
  );
}

function ConfigurationHelp() {
  const { t } = useTranslation();
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="card max-w-2xl p-8 sm:p-10">
        <p className="eyebrow">{t("app.setupEyebrow")}</p>
        <h1 className="page-title mt-2">{t("app.setupTitle")}</h1>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--muted)]">
          <li>{t("app.setup1")}</li>
          <li>{t("app.setup2")}</li>
          <li>{t("app.setup3")}</li>
          <li>{t("app.setup4")}</li>
        </ol>
      </section>
    </main>
  );
}

function SaveOverlay() {
  const { t } = useTranslation();
  return (
    <div className="save-overlay" role="alert" aria-live="assertive">
      <div className="save-dialog">
        <span className="save-spinner" aria-hidden="true" />
        <div>
          <strong>{t("add.savingTitle")}</strong>
          <p>{t("add.savingDescription")}</p>
        </div>
      </div>
    </div>
  );
}

function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="app-footer">
      <span>Wordwise</span>
      <p>{t("footer.createdBy")} <strong>Eddy Chan</strong></p>
    </footer>
  );
}
