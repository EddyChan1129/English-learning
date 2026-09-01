import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { calculateTestUpdate } from "./spaced-repetition";
import { DUPLICATE_VOCABULARY_ERROR, normalizeVocabularyKey } from "./vocabulary";
import { makeCopiedWord } from "./word-copy";
import { normalizeLanguagePreferences } from "./languages";
import { normalizeStoredNewsDocument } from "./news";
import { normalizeUsername } from "./usernames";
import type { FriendDocument, FriendRequestDocument, LanguagePreferences, LearningPlan, LearningPlanEntry, NewSentenceAttempt, NewsDocument, NewWord, UserProfile, UserTarget, WordDocument } from "@/types";

function requireDb() {
  if (!db) throw new Error("Firebase is not configured.");
  return db;
}

export async function saveTarget(uid: string, target: UserTarget) {
  await setDoc(doc(requireDb(), "users", uid), target, { merge: true });
}

export async function loadTarget(uid: string): Promise<UserTarget | null> {
  const snapshot = await getDoc(doc(requireDb(), "users", uid));
  return snapshot.exists() ? (snapshot.data() as UserTarget) : null;
}

export async function loadVocabularyCategories(uid: string): Promise<string[]> {
  const snapshot = await getDoc(doc(requireDb(), "users", uid));
  const categories = snapshot.data()?.vocabularyCategories;
  return Array.isArray(categories)
    ? categories.filter((category): category is string => typeof category === "string").sort((a, b) => a.localeCompare(b))
    : [];
}

export async function addVocabularyCategory(uid: string, name: string) {
  await setDoc(doc(requireDb(), "users", uid), { vocabularyCategories: arrayUnion(name) }, { merge: true });
}

export async function loadLanguagePreferences(uid: string): Promise<LanguagePreferences> {
  const snapshot = await getDoc(doc(requireDb(), "users", uid));
  return normalizeLanguagePreferences(snapshot.data()?.languagePreferences);
}

export async function saveLanguagePreferences(uid: string, preferences: LanguagePreferences) {
  await setDoc(doc(requireDb(), "users", uid), { languagePreferences: preferences }, { merge: true });
}

export async function loadLearningPlans(): Promise<LearningPlan[]> {
  const snapshot = await getDocs(query(
    collection(requireDb(), "learningPlans"),
    where("published", "==", true),
    limit(100),
  ));
  return snapshot.docs
    .map((item) => ({ ...item.data(), id: item.id }) as LearningPlan)
    .sort((a, b) => a.order - b.order);
}

export async function loadLearningPlanEntries(planId: string): Promise<LearningPlanEntry[]> {
  const snapshot = await getDocs(query(
    collection(requireDb(), "learningPlans", planId, "entries"),
    orderBy("order", "asc"),
    limit(2000),
  ));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as LearningPlanEntry);
}

export async function loadPublishedNews(): Promise<NewsDocument[]> {
  const snapshot = await getDocs(query(
    collection(requireDb(), "news"),
    where("published", "==", true),
    limit(365),
  ));
  return snapshot.docs
    .map((item) => normalizeStoredNewsDocument(item.id, item.data()))
    .filter((item): item is NewsDocument => item !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function loadPublishedNewsDay(dayId: string): Promise<NewsDocument | null> {
  const snapshot = await getDoc(doc(requireDb(), "news", dayId));
  if (!snapshot.exists()) return null;
  return normalizeStoredNewsDocument(snapshot.id, snapshot.data());
}

export async function ensureUserProfile(uid: string, email: string | null): Promise<UserProfile> {
  const reference = doc(requireDb(), "profiles", uid);
  const snapshot = await getDoc(reference);
  const existing = snapshot.exists() ? snapshot.data() as UserProfile : null;
  const friendCode = existing?.friendCode && existing.friendCode !== uid
    ? existing.friendCode
    : makeFriendCode(uid, email);

  const profile: UserProfile = {
    uid,
    friendCode,
    displayName: existing?.displayName || email?.split("@")[0] || "Fowl to Phoenix learner",
    normalizedUsername: normalizeUsername(existing?.displayName || email?.split("@")[0] || "Fowl to Phoenix learner"),
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  await setDoc(reference, profile);
  await setDoc(doc(requireDb(), "friendCodes", friendCode), { uid });
  return profile;
}

function makeFriendCode(uid: string, email: string | null) {
  const label = (email?.split("@")[0] || "LEARNER")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase() || "LEARNER";
  return `${label}-${uid.slice(0, 8).toUpperCase()}`;
}

export function subscribeToFriends(
  uid: string,
  onChange: (friends: FriendDocument[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(collection(requireDb(), "users", uid, "friends"), (snapshot) => {
    const friends = snapshot.docs
      .map((item) => item.data() as FriendDocument)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    onChange(friends);
  }, onError);
}

export async function searchUserProfiles(username: string, currentUid: string): Promise<UserProfile[]> {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) throw new Error("invalid-username");
  const snapshot = await getDocs(query(
    collection(requireDb(), "profiles"),
    where("normalizedUsername", "==", normalizedUsername),
    limit(10),
  ));
  return snapshot.docs
    .map((item) => item.data() as UserProfile)
    .filter((profile) => profile.uid !== currentUid);
}

export async function sendFriendRequest(sender: UserProfile, recipient: UserProfile) {
  if (sender.uid === recipient.uid) throw new Error("invalid-username");
  const database = requireDb();
  const friendSnapshot = await getDoc(doc(database, "users", sender.uid, "friends", recipient.uid));
  if (friendSnapshot.exists()) throw new Error("already-friends");
  const request: FriendRequestDocument = {
    senderUid: sender.uid,
    senderDisplayName: sender.displayName,
    recipientUid: recipient.uid,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(database, "users", recipient.uid, "friendRequests", sender.uid), request);
}

export function subscribeToFriendRequests(
  uid: string,
  onChange: (requests: FriendRequestDocument[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(collection(requireDb(), "users", uid, "friendRequests"), (snapshot) => {
    onChange(snapshot.docs
      .map((item) => item.data() as FriendRequestDocument)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, onError);
}

export async function acceptFriendRequest(recipient: UserProfile, request: FriendRequestDocument) {
  const database = requireDb();
  const requestReference = doc(database, "users", recipient.uid, "friendRequests", request.senderUid);
  const recipientFriendReference = doc(database, "users", recipient.uid, "friends", request.senderUid);
  const senderFriendReference = doc(database, "users", request.senderUid, "friends", recipient.uid);
  await runTransaction(database, async (transaction) => {
    const requestSnapshot = await transaction.get(requestReference);
    if (!requestSnapshot.exists()) throw new Error("friend-request-not-found");
    const storedRequest = requestSnapshot.data() as FriendRequestDocument;
    const addedAt = new Date().toISOString();
    transaction.set(recipientFriendReference, {
      uid: storedRequest.senderUid,
      displayName: storedRequest.senderDisplayName,
      addedAt,
    } satisfies FriendDocument);
    transaction.set(senderFriendReference, {
      uid: recipient.uid,
      displayName: recipient.displayName,
      addedAt,
    } satisfies FriendDocument);
    transaction.delete(requestReference);
  });
}

export function subscribeToFriendWords(
  friendUid: string,
  onChange: (words: WordDocument[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeToWords(friendUid, onChange, onError);
}

export function subscribeToWords(
  uid: string,
  onChange: (words: WordDocument[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(collection(requireDb(), "users", uid, "words"), (snapshot) => {
    const words = snapshot.docs
      .map((item) => {
        const data = item.data() as WordDocument;
        return {
          ...data,
          id: item.id,
          chineseMeanings: data.chineseMeanings?.length ? data.chineseMeanings : [data.chineseMeaning].filter(Boolean),
          partsOfSpeech: data.partsOfSpeech ?? [],
          commonPhrases: data.commonPhrases ?? [],
          categories: data.categories ?? [],
          sentenceExplanations: data.sentenceExplanations ?? [],
        };
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    onChange(words);
  }, onError);
}

export async function addWord(uid: string, input: NewWord) {
  const now = new Date().toISOString();
  return insertUniqueWord(uid, {
    ...input,
    stage: 0,
    status: "learning",
    nextTestDate: now,
    createdAt: now,
  });
}

export async function copyFriendWord(uid: string, friendUid: string, source: WordDocument) {
  const now = new Date().toISOString();
  await insertUniqueWord(uid, makeCopiedWord(source, friendUid, now, now));
}

export async function updateWord(uid: string, wordId: string, input: NewWord) {
  const database = requireDb();
  const normalizedWord = normalizeVocabularyKey(input.word);
  if (!normalizedWord) throw new Error("invalid-word");
  await assertNoDuplicateWord(uid, normalizedWord, wordId);

  const wordReference = doc(database, "users", uid, "words", wordId);
  const nextKeyReference = vocabularyKeyReference(uid, normalizedWord);
  await runTransaction(database, async (transaction) => {
    const wordSnapshot = await transaction.get(wordReference);
    if (!wordSnapshot.exists()) throw new Error("This word no longer exists.");

    const currentWord = wordSnapshot.data() as WordDocument;
    const previousNormalizedWord = currentWord.normalizedWord ?? normalizeVocabularyKey(currentWord.word);
    const previousKeyReference = vocabularyKeyReference(uid, previousNormalizedWord);
    const [nextKeySnapshot, previousKeySnapshot] = await Promise.all([
      transaction.get(nextKeyReference),
      previousNormalizedWord === normalizedWord ? Promise.resolve(null) : transaction.get(previousKeyReference),
    ]);
    if (nextKeySnapshot.exists() && nextKeySnapshot.data().wordId !== wordId) {
      throw new Error(DUPLICATE_VOCABULARY_ERROR);
    }

    if (previousKeySnapshot?.exists() && previousKeySnapshot.data().wordId === wordId) {
      transaction.delete(previousKeyReference);
    }
    const normalizedWordKey = nextKeyReference.id;
    transaction.set(nextKeyReference, { wordId, normalizedWord });
    transaction.update(wordReference, { ...input, normalizedWord, normalizedWordKey });
  });
}

type StoredWord = Omit<WordDocument, "id">;

async function insertUniqueWord(uid: string, word: StoredWord) {
  const database = requireDb();
  const normalizedWord = normalizeVocabularyKey(word.word);
  if (!normalizedWord) throw new Error("invalid-word");
  await assertNoDuplicateWord(uid, normalizedWord);

  const wordsReference = collection(database, "users", uid, "words");
  const wordReference = doc(wordsReference);
  const keyReference = vocabularyKeyReference(uid, normalizedWord);
  await runTransaction(database, async (transaction) => {
    const keySnapshot = await transaction.get(keyReference);
    if (keySnapshot.exists()) throw new Error(DUPLICATE_VOCABULARY_ERROR);

    transaction.set(wordReference, {
      ...word,
      normalizedWord,
      normalizedWordKey: keyReference.id,
    });
    transaction.set(keyReference, { wordId: wordReference.id, normalizedWord });
  });
  return wordReference.id;
}

async function assertNoDuplicateWord(uid: string, normalizedWord: string, excludedWordId?: string) {
  const snapshot = await getDocs(collection(requireDb(), "users", uid, "words"));
  const duplicateExists = snapshot.docs.some((item) =>
    item.id !== excludedWordId
      && normalizeVocabularyKey(String(item.data().word ?? "")) === normalizedWord,
  );
  if (duplicateExists) throw new Error(DUPLICATE_VOCABULARY_ERROR);
}

function vocabularyKeyReference(uid: string, normalizedWord: string) {
  const safeKey = `key_${encodeURIComponent(normalizedWord)}`;
  return doc(requireDb(), "users", uid, "vocabularyKeys", safeKey);
}

export async function setWordActive(uid: string, word: WordDocument, active: boolean) {
  const status = active ? (word.stage === 3 ? "mastered" : "learning") : "inactive";
  await updateDoc(doc(requireDb(), "users", uid, "words", word.id), { status });
}

export async function recordTestResult(
  uid: string,
  wordId: string,
  passed: boolean,
  usedHint = false,
) {
  const reference = doc(requireDb(), "users", uid, "words", wordId);
  await runTransaction(requireDb(), async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error("This word no longer exists.");
    const word = snapshot.data() as WordDocument;
    transaction.update(reference, {
      ...calculateTestUpdate(word.stage, passed, new Date().toISOString()),
      lastTestUsedHint: usedHint,
    });
  });
}

export async function recordSentenceAttempt(uid: string, attempt: NewSentenceAttempt) {
  await addDoc(collection(requireDb(), "users", uid, "sentenceAttempts"), {
    ...attempt,
    createdAt: new Date().toISOString(),
  });
}
