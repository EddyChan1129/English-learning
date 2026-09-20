import assert from "node:assert/strict";
import test from "node:test";
import { dateKeyInTimeZone, escapeEmailHtml, isReminderDay } from "./email-reminder.ts";

test("sends every other Hong Kong calendar day across month boundaries", () => {
  assert.equal(isReminderDay(new Date("2026-09-20T00:07:00Z")), true);
  assert.equal(isReminderDay(new Date("2026-09-21T00:07:00Z")), false);
  assert.equal(isReminderDay(new Date("2026-10-01T00:07:00Z")), false);
  assert.equal(isReminderDay(new Date("2026-10-02T00:07:00Z")), true);
});

test("uses the Hong Kong date and escapes stored vocabulary for email HTML", () => {
  assert.equal(dateKeyInTimeZone(new Date("2026-09-19T16:30:00Z"), "Asia/Hong_Kong"), "2026-09-20");
  assert.equal(escapeEmailHtml('<learn & "test">'), "&lt;learn &amp; &quot;test&quot;&gt;");
});
