import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { makeNewsDocument } from "../lib/news.ts";

const argumentsList = process.argv.slice(2);
const replace = argumentsList.includes("--replace");
const unknownFlag = argumentsList.find((argument) => argument.startsWith("--") && argument !== "--replace");
const fileArguments = argumentsList.filter((argument) => !argument.startsWith("--"));
if (unknownFlag) throw new Error(`Unknown option: ${unknownFlag}`);
if (fileArguments.length !== 1) {
  throw new Error("Pass one news JSON file, for example content/news/days-2026-08-28.json.");
}

const filePath = resolve(fileArguments[0]);
const dayId = basename(filePath, ".json");
let input: unknown;
try {
  input = JSON.parse(await readFile(filePath, "utf8"));
} catch {
  throw new Error(`${filePath} is not a readable JSON file.`);
}
const news = makeNewsDocument(dayId, input, new Date().toISOString());

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT;
if (!projectId) throw new Error("Set NEXT_PUBLIC_FIREBASE_PROJECT_ID before uploading news.");

const app = getApps()[0] ?? initializeApp({ credential: applicationDefault(), projectId });
const database = getFirestore(app);
const reference = database.collection("news").doc(dayId);
await database.runTransaction(async (transaction) => {
  const snapshot = await transaction.get(reference);
  if (snapshot.exists && !replace) {
    throw new Error(`${dayId} already exists. Use --replace only when you intend to overwrite it.`);
  }
  transaction.set(reference, news);
});

console.log(`${replace ? "Published or replaced" : "Published"} news/${dayId}: ${news.title}`);
