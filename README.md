# Fowl to Phoenix

A focused vocabulary-learning app built with Next.js App Router, TypeScript, Tailwind CSS, and Firebase Authentication/Firestore.

## Architecture

```text
app/page.tsx                 Home: progress, target, and new-word form
app/test/page.tsx            Sentence gap-fill daily tests
app/history/page.tsx         Grouped and filterable word-card history
app/history/[wordId]/        Word stage and full details
app/friends/page.tsx         Friend code and friend list
app/friends/[friendId]/      A friend's active word cards
app/vocab/                   Firebase-driven learning-plan catalogue
app/vocab/[slug]/            Reusable learning-plan library page
components/AppProvider.tsx   Shared authentication and Firebase data
components/AppNavigation.tsx Home, Test, and History navigation
components/LearningPlanLibrary.tsx Search, examples, speech, and add-to-vocabulary
components/                  Forms, progress, speech, tests, and stage UI
lib/i18n.ts                  English and Traditional Chinese UI copy
public/stage0.png … stage3.png  Fowl to Phoenix stage mascots and brand artwork
lib/date.ts                  Local calendar-date helpers
lib/spaced-repetition.ts     Pure three-pass scheduling algorithm
lib/test-helpers.ts          Answer normalization and gap generation
lib/firebase.ts              Firebase browser SDK initialization
lib/firestore.ts             User-scoped Firestore reads and writes
types/index.ts               Shared application and document types
firestore.rules              Per-user database access rules
scripts/seed-learning-plans.ts  Validated admin catalogue seed
```

## Firestore schema

```text
users/{userId}
  targetWords: number
  targetDays: number
  startDate: "YYYY-MM-DD"
  vocabularyCategories: string[]

users/{userId}/words/{wordId}
  word: string
  chineseMeaning: string
  chineseMeanings: string[]
  synonyms: string[]
  sentences: string[]
  sentenceExplanations: string[]
  partsOfSpeech: ("noun" | "verb" | "adjective" | ...)[]
  commonPhrases: string[]
  categories?: string[]
  stage: 0 | 1 | 2 | 3
  status: "learning" | "mastered" | "inactive"
  nextTestDate: "ISO date-time"
  createdAt: ISO timestamp
  lastTestedAt?: "ISO date-time"
  copiedFrom?: { userId: string, wordId: string }
  sourcePlan?: { planId: string, entryId: string }

learningPlans/{planId}
  slug, title, description, level, entryCount, order, featured, published

learningPlans/{planId}/entries/{entryId}
  order, term, englishDefinition, chineseMeanings, synonyms
  examples: { english: string, chinese: string }[]
  partsOfSpeech, searchTokens

users/{userId}/friends/{friendUserId}
  uid: string
  displayName: string
  addedAt: ISO timestamp

profiles/{userId}
  uid: string
  displayName: string
  friendCode: string
  createdAt: ISO timestamp

friendCodes/{humanReadableCode}
  uid: string
```

The app subscribes to the user's word collection and filters due words in the browser. This avoids a composite Firestore index and is appropriate for a personal vocabulary collection.

## Pages

- **Home** shows target and time progress, today's due count, and the add-word form.
- **News** lists published daily editions; selecting a word or phrase in an article opens a one-sentence vocabulary capture beside the selection.
- **Test** offers formal due reviews that update stages and a shuffled all-word practice mode that leaves stages unchanged.
- **Vocab** lists published learning plans from Firestore; the same dynamic route handles future collections without new navbar links.
- **History** groups words by their added date and supports search, status, part-of-speech, stage, and alphabetical controls.
- **Word detail** opens from a History card and shows the current stage, dates, synonyms, and example sentences.
- **Friends** adds people by exact friend code and opens their active vocabulary cards.
- **Friend wordbook** copies the complete card into the current user's collection at Stage 0 and makes it due today.

Users can edit their own word cards or deactivate them. Inactive words remain in History but are excluded from daily tests and from friends' shared views.

Friendship is intentionally a lightweight one-way connection in this version: adding a valid friend code immediately grants read-only access to that user's active vocabulary. Test progress and all writes remain private to each owner.

The language switcher uses `i18next` and `react-i18next`. English and Traditional Chinese are bundled with the app, and the selected language is remembered in the browser.

While a friend or word is being added, or a word is being copied, edited, deactivated, or reactivated, Fowl to Phoenix blocks the interface and warns before refresh or tab closure so the Firestore write can finish.

## Setup

1. Run `npm install`.
2. Create a Firebase project and web app.
3. Enable **Authentication → Email/Password**.
4. Create a Firestore database and deploy `firestore.rules` (Firebase CLI: `firebase deploy --only firestore:rules`).
5. Validate the bundled 200-entry catalogue with `npm run seed:plans:check`. To upload it, configure Application Default Credentials, set `GOOGLE_CLOUD_PROJECT`, then run `npm run seed:plans`.
6. Copy `.env.example` to `.env.local`, add the Firebase web config values, and set `NEXT_PUBLIC_SITE_URL` to the production URL for canonical, sitemap, and Open Graph metadata.
7. Run `npm run dev`.

## Search and answer-engine metadata

The app includes a web manifest, SVG favicon, generated Open Graph image, canonical URL, robots rules, sitemap, bilingual descriptions, and `WebApplication` JSON-LD. Authenticated Friends, History, and Test routes are excluded from indexing.

## Verification

```bash
npm test
npm run lint
npm run build
```
