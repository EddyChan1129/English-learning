import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { Resend } from "resend";
import { escapeEmailHtml, isReminderDay } from "@/lib/email-reminder";
import { isReadyForTest } from "@/lib/spaced-repetition";
import type { WordDocument } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const ADMIN_APP_NAME = "due-word-email";
const DEFAULT_EMAIL = "yuenho12345@gmail.com";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return Response.json({ error: "cron_not_configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get("force") === "1";
  const now = new Date();
  if (!force && !isReminderDay(now)) {
    return Response.json({ sent: false, reason: "not_reminder_day" });
  }

  try {
    const serviceAccount = requiredJson("FIREBASE_SERVICE_ACCOUNT");
    const firebaseApp = getApps().find((app) => app.name === ADMIN_APP_NAME)
      ?? initializeApp({ credential: cert(serviceAccount) }, ADMIN_APP_NAME);
    const userEmail = process.env.REMINDER_USER_EMAIL?.trim() || DEFAULT_EMAIL;
    const recipient = process.env.REMINDER_TO_EMAIL?.trim() || DEFAULT_EMAIL;
    const user = await getAuth(firebaseApp).getUserByEmail(userEmail);
    const snapshot = await getFirestore(firebaseApp)
      .collection("users")
      .doc(user.uid)
      .collection("words")
      .get();

    const dueWords = snapshot.docs
      .map((document) => ({ id: document.id, ...document.data() }) as WordDocument)
      .filter((word) => isReadyForTest(word, now))
      .sort((left, right) => left.word.localeCompare(right.word));

    if (!force && dueWords.length === 0) {
      return Response.json({ sent: false, reason: "no_due_words" });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;
    const testUrl = new URL("/test", siteUrl).toString();
    const resend = new Resend(requiredEnv("RESEND_API_KEY"));
    const { data, error } = await resend.emails.send({
      from: process.env.REMINDER_FROM_EMAIL?.trim()
        || "Fowl to Phoenix <onboarding@resend.dev>",
      to: recipient,
      subject: `今日有 ${dueWords.length} 個生字要 test`,
      html: buildEmail(dueWords, testUrl),
    });

    if (error) {
      console.error("Resend rejected the due-word email", error.name, error.message);
      return Response.json({ error: "email_rejected" }, { status: 502 });
    }

    return Response.json({ sent: true, count: dueWords.length, emailId: data?.id });
  } catch (error) {
    console.error("Due-word reminder failed", error instanceof Error ? error.message : "unknown_error");
    return Response.json({ error: "reminder_failed" }, { status: 500 });
  }
}

function buildEmail(words: WordDocument[], testUrl: string): string {
  const content = words.length
    ? `<ol>${words.map((word) => (
      `<li><strong>${escapeEmailHtml(word.word)}</strong>${word.chineseMeaning
        ? ` — ${escapeEmailHtml(word.chineseMeaning)}`
        : ""}</li>`
    )).join("")}</ol>`
    : "<p>今日暫時冇生字需要測驗。</p>";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17211b;max-width:560px;margin:auto">
      <h2>今日有 ${words.length} 個生字要 test 📚</h2>
      ${content}
      <p style="margin-top:24px">
        <a href="${escapeEmailHtml(testUrl)}" style="background:#285943;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">
          開始測驗
        </a>
      </p>
    </div>
  `;
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function requiredJson(name: string) {
  return JSON.parse(requiredEnv(name));
}
