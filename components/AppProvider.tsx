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
  addVocabularyCategory,
  addWord,
  copyFriendWord,
  ensureUserProfile,
  loadLearningPlans,
  loadLanguagePreferences,
  loadTarget,
  loadVocabularyCategories,
  recordTestResult,
  saveTarget,
  saveLanguagePreferences,
  setWordActive,
  subscribeToFriends,
  subscribeToWords,
  updateWord,
} from "@/lib/firestore";
import { isReadyForTest } from "@/lib/spaced-repetition";
import { DUPLICATE_VOCABULARY_ERROR, normalizeVocabularyKey } from "@/lib/vocabulary";
import { FALLBACK_LEARNING_PLANS } from "@/lib/learning-plans";
import { DEFAULT_LANGUAGE_PREFERENCES } from "@/lib/languages";
import type { FriendDocument, LanguagePreferences, LearningPlan, NewWord, UserProfile, UserTarget, WordDocument } from "@/types";

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
  vocabularyCategories: string[];
  languagePreferences: LanguagePreferences;
  languagePreferencesLoaded: boolean;
  learningPlans: LearningPlan[];
  learningPlansLoaded: boolean;
  savingWord: boolean;
  dueWords: WordDocument[];
  saveLearningTarget: (target: UserTarget) => Promise<void>;
  createWord: (word: NewWord) => Promise<string>;
  createVocabularyCategory: (name: string) => Promise<string>;
  updateLanguagePreferences: (preferences: LanguagePreferences) => Promise<void>;
  addFriendByCode: (friendCode: string) => Promise<FriendDocument>;
  copyFromFriend: (friendUid: string, word: WordDocument) => Promise<void>;
  editWord: (wordId: string, word: NewWord) => Promise<void>;
  setWordEnabled: (word: WordDocument, active: boolean) => Promise<void>;
  saveTestResult: (word: WordDocument, passed: boolean, usedHint: boolean) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const AUTH_READY_TIMEOUT_MS = 10_000;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!auth);
  const [authProblem, setAuthProblem] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [friends, setFriends] = useState<FriendDocument[]>([]);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const [target, setTarget] = useState<UserTarget | null>(null);
  const [targetLoaded, setTargetLoaded] = useState(false);
  const [words, setWords] = useState<WordDocument[]>([]);
  const [wordsLoaded, setWordsLoaded] = useState(false);
  const [vocabularyCategories, setVocabularyCategories] = useState<string[]>([]);
  const [languagePreferences, setLanguagePreferences] = useState<LanguagePreferences>(DEFAULT_LANGUAGE_PREFERENCES);
  const [languagePreferencesLoaded, setLanguagePreferencesLoaded] = useState(false);
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>(FALLBACK_LEARNING_PLANS);
  const [learningPlansLoaded, setLearningPlansLoaded] = useState(false);
  const [savingWord, setSavingWord] = useState(false);
  const [error, setError] = useState("");
  const [dueClock, setDueClock] = useState(() => Date.now());

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
    const timeout = window.setTimeout(() => setAuthProblem(true), AUTH_READY_TIMEOUT_MS);
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      window.clearTimeout(timeout);
      setAuthProblem(false);
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
        setVocabularyCategories([]);
        setLanguagePreferences(DEFAULT_LANGUAGE_PREFERENCES);
        setLanguagePreferencesLoaded(false);
        setLearningPlansLoaded(false);
      }
    }, () => {
      window.clearTimeout(timeout);
      setAuthProblem(true);
    });
    return () => {
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    loadLearningPlans()
      .then((plans) => setLearningPlans([
        ...FALLBACK_LEARNING_PLANS.filter((fallback) => !plans.some((plan) => plan.id === fallback.id)),
        ...plans,
      ].sort((a, b) => a.order - b.order)))
      .catch(() => setLearningPlans(FALLBACK_LEARNING_PLANS))
      .finally(() => setLearningPlansLoaded(true));
    ensureUserProfile(user.uid, user.email)
      .then(setProfile)
      .catch(() => setError(getErrorMessage()))
      .finally(() => setProfileLoaded(true));
    loadTarget(user.uid)
      .then(setTarget)
      .catch(() => setError(getErrorMessage()))
      .finally(() => setTargetLoaded(true));
    loadVocabularyCategories(user.uid)
      .then(setVocabularyCategories)
      .catch(() => setError(getErrorMessage()));
    loadLanguagePreferences(user.uid)
      .then(setLanguagePreferences)
      .catch(() => setError(getErrorMessage()))
      .finally(() => setLanguagePreferencesLoaded(true));
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

  useEffect(() => {
    const nextDueAt = words.reduce((next, word) => {
      if (word.status !== "learning" || (word.stage === 0 && !word.lastTestedAt)) return next;
      const time = new Date(word.nextTestDate).getTime();
      return time > dueClock && time < next ? time : next;
    }, Number.POSITIVE_INFINITY);
    if (!Number.isFinite(nextDueAt)) return;
    const timer = window.setTimeout(() => setDueClock(Date.now()), nextDueAt - Date.now() + 100);
    return () => window.clearTimeout(timer);
  }, [dueClock, words]);

  const dueWords = useMemo(
    () => words.filter((word) => isReadyForTest(word, new Date(dueClock))),
    [dueClock, words],
  );

  async function saveLearningTarget(nextTarget: UserTarget) {
    if (!user) return;
    await saveTarget(user.uid, nextTarget);
    setTarget(nextTarget);
  }

  async function createWord(word: NewWord) {
    if (!user) throw new Error("not-signed-in");
    const normalizedWord = normalizeVocabularyKey(word.word);
    if (words.some((item) => normalizeVocabularyKey(item.word) === normalizedWord)) {
      throw new Error(DUPLICATE_VOCABULARY_ERROR);
    }
    return protectWrite(() => addWord(user.uid, word));
  }

  async function createVocabularyCategory(name: string) {
    if (!user) throw new Error("not-signed-in");
    const cleanName = name.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!cleanName) throw new Error("invalid-category");
    const existing = vocabularyCategories.find((category) => category.localeCompare(cleanName, undefined, { sensitivity: "accent" }) === 0);
    if (existing) return existing;
    await protectWrite(() => addVocabularyCategory(user.uid, cleanName));
    setVocabularyCategories((current) => [...current, cleanName].sort((a, b) => a.localeCompare(b)));
    return cleanName;
  }

  async function updateLanguagePreferences(nextPreferences: LanguagePreferences) {
    if (!user) return;
    await protectWrite(() => saveLanguagePreferences(user.uid, nextPreferences));
    setLanguagePreferences(nextPreferences);
  }

  async function addFriendByCode(friendCode: string) {
    if (!user) throw new Error("not-signed-in");
    return protectWrite(() => addFriend(user.uid, friendCode));
  }

  async function copyFromFriend(friendUid: string, word: WordDocument) {
    if (!user) return;
    const normalizedWord = normalizeVocabularyKey(word.word);
    const alreadyAdded = words.some((item) => normalizeVocabularyKey(item.word) === normalizedWord);
    if (alreadyAdded) throw new Error(DUPLICATE_VOCABULARY_ERROR);
    await protectWrite(() => copyFriendWord(user.uid, friendUid, word));
  }

  async function editWord(wordId: string, word: NewWord) {
    if (!user) return;
    const normalizedWord = normalizeVocabularyKey(word.word);
    if (words.some((item) => item.id !== wordId && normalizeVocabularyKey(item.word) === normalizedWord)) {
      throw new Error(DUPLICATE_VOCABULARY_ERROR);
    }
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

  async function saveTestResult(word: WordDocument, passed: boolean, usedHint: boolean) {
    if (!user) return;
    await recordTestResult(user.uid, word.id, passed, usedHint);
  }

  if (!isFirebaseConfigured) return <ConfigurationHelp />;
  if (!authReady) return authProblem ? <AuthConnectionProblem /> : <FullPageLoading />;
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
      vocabularyCategories,
      languagePreferences,
      languagePreferencesLoaded,
      learningPlans,
      learningPlansLoaded,
      savingWord,
      dueWords,
      saveLearningTarget,
      createWord,
      createVocabularyCategory,
      updateLanguagePreferences,
      addFriendByCode,
      copyFromFriend,
      editWord,
      setWordEnabled,
      saveTestResult,
    }}>
      <AppNavigation user={user} learningPlans={learningPlans} />
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

function AuthConnectionProblem() {
  const { t } = useTranslation();
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <section className="card max-w-md p-8 text-center">
        <h1 className="font-display text-3xl font-semibold">{t("app.authTimeoutTitle")}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t("app.authTimeoutDescription")}</p>
        <button className="btn-primary mt-6" onClick={() => window.location.reload()}>{t("app.retryConnection")}</button>
      </section>
    </main>
  );
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
      <span>Fowl to Phoenix</span>
      <p>{t("footer.createdBy")} <strong>Eddy Chan</strong></p>
    </footer>
  );
}
