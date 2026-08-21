export function toLocalDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToTimestamp(timestamp: string, days: number): string {
  const date = new Date(timestamp);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function isDue(timestamp: string, now = new Date()): boolean {
  return parseStoredDate(timestamp).getTime() <= now.getTime();
}

export function localDateKey(value: string): string {
  return toLocalDate(parseStoredDate(value));
}

export function formatStoredDate(value: string, language?: string): string {
  return new Intl.DateTimeFormat(language ?? "en", { dateStyle: "medium" }).format(parseStoredDate(value));
}

export function formatStoredDateTime(value: string, language?: string): string {
  return new Intl.DateTimeFormat(language ?? "en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(parseStoredDate(value));
}

function parseStoredDate(value: string): Date {
  if (!value.includes("T")) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

export function daysElapsed(startDate: string, today = toLocalDate()): number {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = today.split("-").map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1);
}
