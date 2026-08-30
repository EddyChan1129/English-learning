import test from "node:test";
import assert from "node:assert/strict";
import {
  makeNewsDocument,
  newsDateFromDayId,
  normalizeNewsSelection,
  sentenceAtOffset,
  validateNewsUploadInput,
} from "./news.ts";

const validInput = {
  title: "  A new chapter for language learners  ",
  summary: "A short daily summary.",
  paragraphs: [" First paragraph. ", "", "Second paragraph."],
  sourceName: "Example News",
  sourceUrl: "https://example.com/news/story",
};

const bilingualInput = [{
  title: "T1 survive a five-game thriller",
  summary: "T1 won the playoff series 3-2.",
  chineseMeaning: "T1 在季後賽以 3:2 勝出。",
  paragraphs: [{
    english: "T1 won the deciding fifth game.",
    chinese: "T1 在第五局決勝局勝出。",
  }],
  sourceName: "Example News",
  sourceUrl: "https://example.com/news/t1",
}];

test("validates and normalizes a daily news document", () => {
  assert.deepEqual(makeNewsDocument("days-2026-08-28", validInput, "2026-08-28T08:00:00.000Z"), {
    id: "days-2026-08-28",
    date: "2026-08-28",
    articles: [{
      title: "A new chapter for language learners",
      summary: "A short daily summary.",
      chineseMeaning: "",
      paragraphs: [
        { english: "First paragraph.", chinese: "" },
        { english: "Second paragraph.", chinese: "" },
      ],
      sourceName: "Example News",
      sourceUrl: "https://example.com/news/story",
    }],
    publishedAt: "2026-08-28T08:00:00.000Z",
    published: true,
  });
});

test("accepts the bilingual multi-article news format", () => {
  assert.deepEqual(validateNewsUploadInput(bilingualInput), bilingualInput);
});

test("rejects invalid dates and unsafe news input", () => {
  assert.throws(() => newsDateFromDayId("days-2026-02-30"), /real date/);
  assert.throws(() => validateNewsUploadInput({ ...validInput, paragraphs: [] }), /at least one/);
  assert.throws(() => validateNewsUploadInput({ ...validInput, sourceUrl: "javascript:alert(1)" }), /http or https/);
  assert.throws(() => validateNewsUploadInput([{ ...bilingualInput[0], chineseMeaning: "" }]), /chineseMeaning is required/);
});

test("turns a news selection into a clean vocabulary example", () => {
  const paragraph = "Markets opened higher. Investors remained cautiously optimistic about the outlook.";
  assert.equal(normalizeNewsSelection("  “cautiously   optimistic,” "), "cautiously optimistic");
  assert.equal(sentenceAtOffset(paragraph, paragraph.indexOf("cautiously")), "Investors remained cautiously optimistic about the outlook.");
  assert.equal(sentenceAtOffset("第一句。投資者保持審慎樂觀。", 7), "投資者保持審慎樂觀。");
});
