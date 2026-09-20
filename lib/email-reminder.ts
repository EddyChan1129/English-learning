const DAY_MS = 86_400_000;

export const REMINDER_START_DATE = "2026-09-20";

export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function isReminderDay(
  date: Date,
  startDate = REMINDER_START_DATE,
  timeZone = "Asia/Hong_Kong",
): boolean {
  const today = dateKeyInTimeZone(date, timeZone);
  const elapsedDays = Math.floor(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / DAY_MS,
  );
  return elapsedDays >= 0 && elapsedDays % 2 === 0;
}

export function escapeEmailHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
