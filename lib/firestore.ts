import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { calculateTestUpdate } from "./spaced-repetition";
import { toLocalDate } from "./date";
import { makeCopiedWord } from "./word-copy";
import type { FriendDocument, NewWord, UserProfile, UserTarget, WordDocument } from "@/types";

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
    displayName: existing?.displayName || email?.split("@")[0] || "Wordwise learner",
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

export async function addFriend(uid: string, friendCode: string): Promise<FriendDocument> {
  const normalizedCode = friendCode.trim().toUpperCase();
  if (!normalizedCode) throw new Error("invalid-friend-code");

  const codeSnapshot = await getDoc(doc(requireDb(), "friendCodes", normalizedCode));
  if (!codeSnapshot.exists()) throw new Error("friend-not-found");
  const friendUid = codeSnapshot.data().uid as string;
  if (friendUid === uid) throw new Error("invalid-friend-code");
  const profileSnapshot = await getDoc(doc(requireDb(), "profiles", friendUid));
  if (!profileSnapshot.exists()) throw new Error("friend-not-found");
  const profile = profileSnapshot.data() as UserProfile;
  const friend: FriendDocument = {
    uid: profile.uid,
    displayName: profile.displayName,
    addedAt: new Date().toISOString(),
  };
  await setDoc(doc(requireDb(), "users", uid, "friends", profile.uid), friend);
  return friend;
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
      .map((item) => ({ id: item.id, ...item.data() }) as WordDocument)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    onChange(words);
  }, onError);
}

export async function addWord(uid: string, input: NewWord) {
  const today = toLocalDate();
  await addDoc(collection(requireDb(), "users", uid, "words"), {
    ...input,
    stage: 0,
    status: "learning",
    nextTestDate: today,
    createdAt: new Date().toISOString(),
  });
}

export async function copyFriendWord(uid: string, friendUid: string, source: WordDocument) {
  const today = toLocalDate();
  await addDoc(
    collection(requireDb(), "users", uid, "words"),
    makeCopiedWord(source, friendUid, today, new Date().toISOString()),
  );
}

export async function updateWord(uid: string, wordId: string, input: NewWord) {
  await updateDoc(doc(requireDb(), "users", uid, "words", wordId), input);
}

export async function setWordActive(uid: string, word: WordDocument, active: boolean) {
  const status = active ? (word.stage === 3 ? "mastered" : "learning") : "inactive";
  await updateDoc(doc(requireDb(), "users", uid, "words", word.id), { status });
}

export async function recordTestResult(
  uid: string,
  wordId: string,
  passed: boolean,
) {
  const reference = doc(requireDb(), "users", uid, "words", wordId);
  await runTransaction(requireDb(), async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error("This word no longer exists.");
    const word = snapshot.data() as WordDocument;
    transaction.update(reference, calculateTestUpdate(word.stage, passed, toLocalDate()));
  });
}
