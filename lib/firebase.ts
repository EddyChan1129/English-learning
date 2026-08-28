import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, inMemoryPersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
const existingApp = getApps().length ? getApp() : null;
const app = isFirebaseConfigured
  ? existingApp ?? initializeApp(firebaseConfig)
  : null;

export const auth = app
  ? existingApp
    ? getAuth(app)
    : initializeAuth(app, { persistence: [browserLocalPersistence, inMemoryPersistence] })
  : null;
export const db = app ? getFirestore(app) : null;
