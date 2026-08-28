import test from "node:test";
import assert from "node:assert/strict";
import { makeNewsDocument, newsDateFromDayId, validateNewsUploadInput } from "./news.ts";

const validInput = {
  title: "  A new chapter for language learners  ",
  summary: "A short daily summary.",
  paragraphs: [" First paragraph. ", "", "Second paragraph."],
  sourceName: "Example News",
  sourceUrl: "https://example.com/news/story",
};

test("validates and normalizes a daily news document", () => {
  assert.deepEqual(makeNewsDocument("days-2026-08-28", validInput, "2026-08-28T08:00:00.000Z"), {
    id: "days-2026-08-28",
    date: "2026-08-28",
    title: "A new chapter for language learners",
    summary: "A short daily summary.",
    paragraphs: ["First paragraph.", "Second paragraph."],
    sourceName: "Example News",
    sourceUrl: "https://example.com/news/story",
    publishedAt: "2026-08-28T08:00:00.000Z",
    published: true,
  });
});

test("rejects invalid dates and unsafe news input", () => {
  assert.throws(() => newsDateFromDayId("days-2026-02-30"), /real date/);
  assert.throws(() => validateNewsUploadInput({ ...validInput, paragraphs: [] }), /at least one/);
  assert.throws(() => validateNewsUploadInput({ ...validInput, sourceUrl: "javascript:alert(1)" }), /http or https/);
});
