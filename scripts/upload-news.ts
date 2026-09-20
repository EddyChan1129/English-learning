import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { makeNewsDocument, newsDateFromDayId, validateNewsUploadInput } from "../lib/news.ts";

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
const articles = validateNewsUploadInput(input);
const publishedAt = new Date().toISOString();
const date = newsDateFromDayId(dayId);
const news = articles.map((article, index) =>
  makeNewsDocument(`${dayId}-${String(index + 1).padStart(2, "0")}`, article, publishedAt),
);

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT;
if (!projectId) throw new Error("Set NEXT_PUBLIC_FIREBASE_PROJECT_ID before uploading news.");

const app = getApps()[0] ?? initializeApp({ credential: applicationDefault(), projectId });
const database = getFirestore(app);
const existing = await database.collection("news").where("date", "==", date).get();
if (!existing.empty && !replace) {
  throw new Error(`${dayId} already exists. Use --replace only when you intend to overwrite it.`);
}

const batch = database.batch();
if (replace) existing.docs.forEach((snapshot) => batch.delete(snapshot.ref));
news.forEach((article) => batch.set(database.collection("news").doc(article.id), article));
await batch.commit();

console.log(`${replace ? "Published or replaced" : "Published"} ${news.length} individual news document(s) for ${date}`);
