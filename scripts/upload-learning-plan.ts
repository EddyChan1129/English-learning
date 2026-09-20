import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type DocumentReference, type WriteBatch } from "firebase-admin/firestore";
import { makeLearningPlanUpload } from "../lib/learning-plan-upload.ts";
import type { LearningPlanEntry } from "../types/index.ts";

const argumentsList = process.argv.slice(2);
const replace = argumentsList.includes("--replace");
const unknownFlag = argumentsList.find((argument) => argument.startsWith("--") && argument !== "--replace");
const fileArguments = argumentsList.filter((argument) => !argument.startsWith("--"));
if (unknownFlag) throw new Error(`Unknown option: ${unknownFlag}`);
if (fileArguments.length !== 1) throw new Error("Pass one learning-plan JSON file.");

const filePath = resolve(fileArguments[0]);
let input: unknown;
try {
  input = JSON.parse(await readFile(filePath, "utf8"));
} catch {
  throw new Error(`${filePath} is not a readable JSON file.`);
}
const { plan, entries } = makeLearningPlanUpload(input);

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
if (!projectId) throw new Error("Set NEXT_PUBLIC_FIREBASE_PROJECT_ID before uploading a learning plan.");

const app = getApps()[0] ?? initializeApp({ credential: applicationDefault(), projectId });
const database = getFirestore(app);
const planReference = database.collection("learningPlans").doc(plan.id);
const planSnapshot = await planReference.get();
if (planSnapshot.exists && !replace) {
  throw new Error(`${plan.id} already exists. Use --replace only when you intend to overwrite it.`);
}

await planReference.set({ ...plan, published: false });
const entryCollection = planReference.collection("entries");
const existingReferences = await entryCollection.listDocuments();
const nextIds = new Set(entries.map((entry) => entry.id));
const writes: Array<{ reference: DocumentReference; entry?: LearningPlanEntry }> = [
  ...existingReferences.filter((reference) => !nextIds.has(reference.id)).map((reference) => ({ reference })),
  ...entries.map((entry) => ({ reference: entryCollection.doc(entry.id), entry })),
];

for (let index = 0; index < writes.length; index += 400) {
  const batch = database.batch();
  for (const write of writes.slice(index, index + 400)) applyWrite(batch, write);
  await batch.commit();
}
await planReference.set(plan);

console.log(`${replace ? "Published or replaced" : "Published"} learningPlans/${plan.id} with ${entries.length} entries.`);

function applyWrite(batch: WriteBatch, write: { reference: DocumentReference; entry?: LearningPlanEntry }) {
  if (write.entry) batch.set(write.reference, write.entry);
  else batch.delete(write.reference);
}
