import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const email = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
const write = process.argv.includes("--write");
if (!email?.includes("@")) throw new Error("Pass the user's Firebase login email address.");
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("Set GOOGLE_APPLICATION_CREDENTIALS to the downloaded Admin SDK JSON file.");
}

const app = getApps()[0] ?? initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});
const uid = (await getAuth(app).getUserByEmail(email)).uid;
const database = getFirestore(app);
const snapshot = await database.collection("users").doc(uid).collection("words").where("stage", "==", 0).get();
const words = snapshot.docs.filter((item) => item.data().status === "learning");

console.table(words.map((item) => ({
  id: item.id,
  word: item.data().word,
  nextTestDate: item.data().nextTestDate,
})));

if (!write) {
  console.log(`Found ${words.length} learning Stage 0 cards. No writes made.`);
  console.log("Run again with --write to make them testable immediately.");
  process.exit(0);
}

const nextTestDate = new Date().toISOString();
for (let start = 0; start < words.length; start += 500) {
  const batch = database.batch();
  for (const item of words.slice(start, start + 500)) batch.update(item.ref, { nextTestDate });
  await batch.commit();
}

console.log(`Updated ${words.length} learning Stage 0 cards for ${email}.`);
console.log(`nextTestDate: ${nextTestDate}`);
