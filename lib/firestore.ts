import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { calculateTestUpdate } from "./spaced-repetition";
import { toLocalDate } from "./date";
import type { NewWord, UserTarget, WordDocument } from "@/types";

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
