import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { ESSENTIAL_PHRASAL_VERBS } from "../lib/essential-phrasal-verbs.ts";
import { ESSENTIAL_PLAN_ID, FALLBACK_LEARNING_PLANS, essentialEntryToLearningPlanEntry } from "../lib/learning-plans.ts";

const plan = FALLBACK_LEARNING_PLANS[0];
const entries = ESSENTIAL_PHRASAL_VERBS.map(essentialEntryToLearningPlanEntry);

function validate() {
  if (entries.length !== plan.entryCount) throw new Error(`Expected ${plan.entryCount} entries, found ${entries.length}.`);
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error("Entry IDs must be unique.");
  for (const entry of entries) {
    if (entry.examples.length < 2 || entry.examples.some((example) => !example.english.trim() || !example.chinese.trim())) {
      throw new Error(`Entry ${entry.id} must have two bilingual examples.`);
    }
  }
}

validate();

if (!process.argv.includes("--write")) {
  console.log(`Validated ${entries.length} entries for ${plan.title.en}. No Firebase writes made.`);
  console.log("Run npm run seed:plans with Application Default Credentials to upload the catalogue.");
  process.exit(0);
}

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
if (!projectId) throw new Error("Set GOOGLE_CLOUD_PROJECT before seeding learning plans.");

const app = getApps()[0] ?? initializeApp({ credential: applicationDefault(), projectId });
const database = getFirestore(app);
const batch = database.batch();
batch.set(database.collection("learningPlans").doc(ESSENTIAL_PLAN_ID), plan);
for (const entry of entries) {
  batch.set(database.collection("learningPlans").doc(ESSENTIAL_PLAN_ID).collection("entries").doc(entry.id), entry);
}
await batch.commit();
console.log(`Uploaded ${entries.length} entries to learningPlans/${ESSENTIAL_PLAN_ID}.`);
