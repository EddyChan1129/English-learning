# Wordwise

A focused vocabulary-learning app built with Next.js App Router, TypeScript, Tailwind CSS, and Firebase Authentication/Firestore.

## Architecture

```text
app/                         Next.js pages and global styles
components/                  Auth, dashboard, word entry, tests, and word list
lib/date.ts                  Local calendar-date helpers
lib/spaced-repetition.ts     Pure three-pass scheduling algorithm
lib/test-helpers.ts          Answer normalization and gap generation
lib/firebase.ts              Firebase browser SDK initialization
lib/firestore.ts             User-scoped Firestore reads and writes
types/index.ts               Shared application and document types
firestore.rules              Per-user database access rules
```

## Firestore schema

```text
users/{userId}
  targetWords: number
  targetDays: number
  startDate: "YYYY-MM-DD"

users/{userId}/words/{wordId}
  word: string
  chineseMeaning: string
  synonyms: string[]
  sentences: string[]
  stage: 0 | 1 | 2 | 3
  status: "learning" | "mastered"
  nextTestDate: "YYYY-MM-DD"
  createdAt: ISO timestamp
  lastTestedAt?: "YYYY-MM-DD"
```

The app subscribes to the user's word collection and filters due words in the browser. This avoids a composite Firestore index and is appropriate for a personal vocabulary collection.

## Setup

1. Run `npm install`.
2. Create a Firebase project and web app.
3. Enable **Authentication → Email/Password**.
4. Create a Firestore database and deploy `firestore.rules` (Firebase CLI: `firebase deploy --only firestore:rules`).
5. Copy `.env.example` to `.env.local` and add the Firebase web config values.
6. Run `npm run dev`.

## Verification

```bash
npm test
npm run lint
npm run build
```
