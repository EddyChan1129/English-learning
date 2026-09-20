"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { AppNavigation } from "@/components/AppNavigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { readGuestData, updateGuestData, subscribeGuestData } from "@/lib/guest-storage";
import { makeGuestWord, validateGuestWord, type GuestData } from "@/lib/guest-data";
import { auth } from "@/lib/firebase";
import i18n from "@/lib/i18n";
import {
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
import { calculateTestUpdate, isReadyForTest } from "@/lib/spaced-repetition";
import { DUPLICATE_VOCABULARY_ERROR, normalizeVocabularyKey } from "@/lib/vocabulary";
import { FALLBACK_LEARNING_PLANS } from "@/lib/learning-plans";
import { DEFAULT_LANGUAGE_PREFERENCES } from "@/lib/languages";
import type { FriendDocument, LanguagePreferences, LearningPlan, NewWord, UserProfile, UserTarget, WordDocument } from "@/types";

type AppContextValue = {
  user: User | null;
  guestData: GuestData | null;
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
  refreshAccount: () => Promise<void>;
  dueWords: WordDocument[];
  saveLearningTarget: (target: UserTarget) => Promise<void>;
  createWord: (word: NewWord) => Promise<string>;
  createVocabularyCategory: (name: string) => Promise<string>;
  updateLanguagePreferences: (preferences: LanguagePreferences) => Promise<void>;
  copyFromFriend: (friendUid: string, word: WordDocument) => Promise<void>;
  editWord: (wordId: string, word: NewWord) => Promise<void>;
  setWordEnabled: (word: WordDocument, active: boolean) => Promise<void>;
  saveTestResult: (word: WordDocument, passed: boolean, usedHint: boolean) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const AUTH_READY_TIMEOUT_MS = 10_000;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ user: User | null; ready: boolean }>({ user: null, ready: !auth });
  useEffect(() => {
    if (!auth) return;
    const timeout = window.setTimeout(() => setSession({ user: null, ready: true }), AUTH_READY_TIMEOUT_MS);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      window.clearTimeout(timeout);
      setSession({ user, ready: true });
    }, () => {
      window.clearTimeout(timeout);
      setSession({ user: null, ready: true });
    });
    return () => { window.clearTimeout(timeout); unsubscribe(); };
  }, []);
  if (!session.ready) return <FullPageLoading />;
  return <LearningProvider key={session.user?.uid ?? "guest"} user={session.user}>{children}</LearningProvider>;
}

function LearningProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [storageProblem, setStorageProblem] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
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
    if (user) return;
    let active = true;
    let revision = 0;
    const refresh = () => {
      const request = ++revision;
      readGuestData().then((data) => {
        if (!active || request !== revision) return;
        setGuestData(data);
        setWords(data.words);
        setTarget(data.target);
        setVocabularyCategories(data.categories);
        setLanguagePreferences(data.preferences);
        setWordsLoaded(true); setTargetLoaded(true); setLanguagePreferencesLoaded(true);
        setFriendsLoaded(true); setProfileLoaded(true);
        setStorageProblem(false);
      }).catch(() => { if (active) setStorageProblem(true); });
    };
    refresh();
    const unsubscribe = subscribeGuestData(refresh);
    return () => { active = false; unsubscribe(); };
  }, [user]);

  useEffect(() => {
    let active = true;
    loadLearningPlans()
      .then((plans) => { if (active) setLearningPlans([
        ...FALLBACK_LEARNING_PLANS.filter((fallback) => !plans.some((plan) => plan.id === fallback.id)),
        ...plans,
      ].sort((a, b) => a.order - b.order)); })
      .catch(() => {})
      .finally(() => { if (active) setLearningPlansLoaded(true); });
    return () => { active = false; };
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

  async function refreshAccount() {
    if (!user) return;
    const [nextTarget, nextCategories, nextPreferences] = await Promise.all([
      loadTarget(user.uid), loadVocabularyCategories(user.uid), loadLanguagePreferences(user.uid),
    ]);
    setTarget(nextTarget); setVocabularyCategories(nextCategories); setLanguagePreferences(nextPreferences);
  }

  async function saveLearningTarget(nextTarget: UserTarget) {
    if (!user) { await protectWrite(() => updateGuestData((data) => ({ ...data, target: nextTarget }))); return; }
    await saveTarget(user.uid, nextTarget);
    setTarget(nextTarget);
  }

  async function createWord(word: NewWord) {
    if (!user) {
      const id = crypto.randomUUID();
      await protectWrite(() => updateGuestData((data) => ({ ...data, words: [makeGuestWord(word, data.words, id, new Date().toISOString()), ...data.words] })));
      return id;
    }
    const normalizedWord = normalizeVocabularyKey(word.word);
    if (words.some((item) => normalizeVocabularyKey(item.word) === normalizedWord)) {
      throw new Error(DUPLICATE_VOCABULARY_ERROR);
    }
    return protectWrite(() => addWord(user.uid, word));
  }

  async function createVocabularyCategory(name: string) {
    const cleanName = name.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!cleanName) throw new Error("invalid-category");
    const existing = vocabularyCategories.find((category) => category.localeCompare(cleanName, undefined, { sensitivity: "accent" }) === 0);
    if (existing) return existing;
    if (!user) {
      await protectWrite(() => updateGuestData((data) => ({ ...data, categories: [...new Set([...data.categories, cleanName])].sort() })));
      return cleanName;
    }
    await protectWrite(() => addVocabularyCategory(user.uid, cleanName));
    setVocabularyCategories((current) => [...current, cleanName].sort((a, b) => a.localeCompare(b)));
    return cleanName;
  }

  async function updateLanguagePreferences(nextPreferences: LanguagePreferences) {
    if (!user) { await protectWrite(() => updateGuestData((data) => ({ ...data, preferences: nextPreferences }))); return; }
    await protectWrite(() => saveLanguagePreferences(user.uid, nextPreferences));
    setLanguagePreferences(nextPreferences);
  }

  async function copyFromFriend(friendUid: string, word: WordDocument) {
    if (!user) throw new Error("not-signed-in");
    const normalizedWord = normalizeVocabularyKey(word.word);
    const alreadyAdded = words.some((item) => normalizeVocabularyKey(item.word) === normalizedWord);
    if (alreadyAdded) throw new Error(DUPLICATE_VOCABULARY_ERROR);
    await protectWrite(() => copyFriendWord(user.uid, friendUid, word));
  }

  async function editWord(wordId: string, word: NewWord) {
    if (!user) {
      await protectWrite(() => updateGuestData((data) => {
        validateGuestWord(word, data.words, wordId);
        if (!data.words.some((item) => item.id === wordId)) throw new Error("missing-word");
        return { ...data, words: data.words.map((item) => item.id === wordId ? { ...item, ...word } : item) };
      }));
      return;
    }
    const normalizedWord = normalizeVocabularyKey(word.word);
    if (words.some((item) => item.id !== wordId && normalizeVocabularyKey(item.word) === normalizedWord)) {
      throw new Error(DUPLICATE_VOCABULARY_ERROR);
    }
    await protectWrite(() => updateWord(user.uid, wordId, word));
  }

  async function setWordEnabled(word: WordDocument, active: boolean) {
    if (!user) {
      await protectWrite(() => updateGuestData((data) => ({ ...data, words: data.words.map((item) => item.id === word.id
        ? { ...item, status: active ? (item.stage === 3 ? "mastered" : "learning") : "inactive" } : item) })));
      return;
    }
    await protectWrite(() => setWordActive(user.uid, word, active));
  }

  async function protectWrite<Result>(action: () => Promise<Result>) {
    setSavingWord(true);
    try {
      return await action();
    } catch (error) {
      setError(user ? getErrorMessage() : t("guest.saveError"));
      throw error;
    } finally {
      setSavingWord(false);
    }
  }

  async function saveTestResult(word: WordDocument, passed: boolean, usedHint: boolean) {
    if (!user) {
      await protectWrite(() => updateGuestData((data) => {
        if (!data.words.some((item) => item.id === word.id)) throw new Error("missing-word");
        return { ...data, words: data.words.map((item) => item.id === word.id
          ? { ...item, ...calculateTestUpdate(item.stage, passed, new Date().toISOString()), lastTestUsedHint: usedHint } : item) };
      }));
      setDueClock(Date.now());
      return;
    }
    await recordTestResult(user.uid, word.id, passed, usedHint);
  }

  if (!user && storageProblem && pathname !== "/login") return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="page-title">{t("guest.storageErrorTitle")}</h1>
      <p className="my-4" role="alert">{t("guest.storageError")}</p>
      <button className="btn-primary" onClick={() => window.location.reload()}>{t("app.retryConnection")}</button>
      <Link className="btn-secondary ml-3" href="/login">{t("guest.signIn")}</Link>
    </main>
  );
  if (!user && !guestData && pathname !== "/login") return <FullPageLoading />;

  return (
    <AppContext.Provider value={{
      user,
      guestData,
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
      refreshAccount,
      dueWords,
      saveLearningTarget,
      createWord,
      createVocabularyCategory,
      updateLanguagePreferences,
      copyFromFriend,
      editWord,
      setWordEnabled,
      saveTestResult,
    }}>
      <AppNavigation user={user} learningPlans={learningPlans} />
      <main className="app-content">
        {!user ? <p className="mb-5 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3 text-sm">{t("guest.notice")} <Link href="/settings" className="text-button">{t("guest.manage")}</Link></p> : null}
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
