import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { makeLearningPlanUpload } from "../lib/learning-plan-upload.ts";
import { makeGapQuestion } from "../lib/test-helpers.ts";

type Example = { en: string; zhHant: string };
type Source = {
  id: string;
  slug: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  level: { en: string; zh: string };
  order: number;
  featured: boolean;
  coverage: { wordCount: number; coverageMeasured: boolean; coveragePercent: number | null };
  entries: {
    id: number;
    word: string;
    englishDefinition: string;
    chineseMeaningZhHant: string;
    partOfSpeech: string[];
    synonyms: string[];
    examples: Example[];
    patterns: string[];
    uses: { sense: string; meaningZhHant: string; pattern: string; examples: Example[] }[];
    phrases: { phrase: string; meaningZhHant: string }[];
  }[];
  prerequisites: {
    noteZhHant: string;
    wordGroups: { topicZhHant: string; words: string[]; example: Example }[];
    grammar: { topicZhHant: string; pattern: string; example: Example }[];
    contractions: { short: string; full: string }[];
    readinessCheckZhHant: string[];
  };
  speakingPractice: {
    noteZhHant: string;
    scenarios: {
      id: string;
      titleZhHant: string;
      targetWords: string[];
      additionalWords: string[];
      dialogue: (Example & { speaker: string })[];
      taskZhHant: string;
      followUpQuestion: string;
      noteZhHant: string;
    }[];
  };
  studyPlan: {
    paceZhHant: string;
    sequence: { step: number; titleZhHant: string; instructionsZhHant: string }[];
    selfCheckZhHant: string[];
    progressRuleZhHant: string;
    nextStepZhHant: string;
  };
};

const args = process.argv.slice(2);
assert.ok(args.length === 0 || (args.length === 1 && args[0] === "--check"), "Only --check is supported.");
const directory = new URL("../content/learning-plans/", import.meta.url);
const sourcePath = new URL("spoken-english-core-400.json", directory);
const source: Source = JSON.parse(await readFile(sourcePath, "utf8"));
const words = new Set(source.entries.map((entry) => entry.word.toLowerCase()));
assert.equal(source.entries.length, 400, "Keep exactly 400 headwords.");
assert.equal(words.size, 400, "Headwords must be unique.");
assert.equal(source.coverage.wordCount, 400);
assert.equal(source.coverage.coverageMeasured, false);
assert.equal(source.coverage.coveragePercent, null, "Do not imply unmeasured coverage.");

function text(value: unknown, label: string): asserts value is string {
  assert.ok(typeof value === "string" && value.trim().length > 0, `${label} must not be blank.`);
  assert.doesNotMatch(value, /視乎意思|常見搭配視乎語境|Try using the word/i, `${label} contains a placeholder.`);
}

function example(pair: Example, label: string) {
  text(pair.en, `${label}.en`);
  text(pair.zhHant, `${label}.zhHant`);
}

for (const [index, entry] of source.entries.entries()) {
  assert.equal(entry.id, index + 1, "Keep the original stable entry order.");
  text(entry.chineseMeaningZhHant, `${entry.word}.meaning`);
  assert.ok(entry.examples.length >= 2, `${entry.word} needs at least two quiz examples.`);
  assert.notEqual(entry.examples[0].en, entry.examples[1].en, `${entry.word} needs distinct examples.`);
  for (const pair of entry.examples) {
    example(pair, entry.word);
    assert.notEqual(makeGapQuestion(pair.en, entry.word).sentence, pair.en, `${entry.word}: quiz cannot mask '${pair.en}'.`);
  }
  assert.ok(entry.patterns.length > 0, `${entry.word} needs a concrete pattern.`);
  entry.patterns.forEach((pattern) => text(pattern, `${entry.word}.pattern`));
  assert.ok(entry.uses.length > 0, `${entry.word} needs an explained use.`);
  assert.equal(new Set(entry.uses.map((use) => use.sense)).size, entry.uses.length, `${entry.word} has duplicate sense IDs.`);
  for (const use of entry.uses) {
    text(use.sense, `${entry.word}.sense`);
    text(use.meaningZhHant, `${entry.word}.${use.sense}.meaning`);
    text(use.pattern, `${entry.word}.${use.sense}.pattern`);
    assert.ok(use.examples.length >= 2, `${entry.word}.${use.sense} needs at least two examples.`);
    assert.equal(new Set(use.examples.map((pair) => pair.en.trim().toLowerCase())).size, use.examples.length, `${entry.word}.${use.sense} has duplicate examples.`);
    for (const pair of use.examples) {
      example(pair, `${entry.word}.${use.sense}`);
      assert.notEqual(makeGapQuestion(pair.en, entry.word).sentence, pair.en, `${entry.word}.${use.sense}: quiz cannot mask '${pair.en}'.`);
    }
  }
  assert.deepEqual(entry.examples, [...new Map(entry.uses.flatMap((use) => use.examples)
    .map((pair) => [pair.en.trim().toLowerCase(), pair])).values()], `${entry.word}: examples must include every sense.`);
  for (const phrase of entry.phrases) {
    text(phrase.phrase, `${entry.word}.phrase`);
    text(phrase.meaningZhHant, `${entry.word}.phraseMeaning`);
  }
}
assert.equal(source.speakingPractice.scenarios.length, 10);
assert.equal(new Set(source.speakingPractice.scenarios.map(({ id }) => id)).size, 10);
for (const scenario of source.speakingPractice.scenarios) {
  assert.ok(scenario.targetWords.length > 0);
  scenario.targetWords.forEach((word) => assert.ok(words.has(word), `${scenario.id}: unknown core word ${word}`));
  scenario.additionalWords.forEach((word) => assert.ok(!words.has(word), `${word} is already in the core list.`));
  assert.ok(scenario.dialogue.length >= 4, `${scenario.id} needs a conversation.`);
  scenario.dialogue.forEach((turn) => example(turn, scenario.id));
  text(scenario.taskZhHant, `${scenario.id}.task`);
  text(scenario.followUpQuestion, `${scenario.id}.followUpQuestion`);
}
for (const group of source.prerequisites.wordGroups) {
  assert.ok(group.words.length > 0);
  example(group.example, group.topicZhHant);
}
source.prerequisites.grammar.forEach((rule) => example(rule.example, rule.topicZhHant));
assert.ok(source.studyPlan.selfCheckZhHant.length >= 4);

// This is an explicit projection: richer teaching material stays in the source JSON.
const payload = {
  id: source.id,
  slug: source.slug,
  title: source.title,
  description: source.description,
  level: source.level,
  order: source.order,
  featured: source.featured,
  entries: source.entries.map((entry) => ({
    term: entry.word,
    englishDefinition: entry.englishDefinition,
    chineseMeanings: [entry.chineseMeaningZhHant],
    synonyms: entry.synonyms,
    partsOfSpeech: entry.partOfSpeech,
    examples: entry.uses.flatMap((use) => use.examples.map(({ en, zhHant }) => ({
      english: en,
      chinese: `【${use.meaningZhHant}】${zhHant}`,
      sense: use.sense,
      meaning: use.meaningZhHant,
      pattern: use.pattern,
    }))),
  })),
};
makeLearningPlanUpload(payload);
for (const entry of payload.entries) {
  const original = source.entries.find((item) => item.word === entry.term)!;
  for (const use of original.uses) {
    assert.deepEqual(entry.examples.filter((pair) => pair.sense === use.sense).map((pair) => pair.english), use.examples.map((pair) => pair.en));
  }
}
const bullets = (lines: string[]) => lines.map((line) => `- ${line}`).join("\n");
const guide = [
  `# ${source.title.zh}`,
  "> Generated by npm run spoken-core:build. Edit spoken-english-core-400.json, then rebuild.",
  source.description.zh,
  "## 點樣學",
  source.studyPlan.paceZhHant,
  ...source.studyPlan.sequence.map((step) => `### ${step.step}. ${step.titleZhHant}\n\n${step.instructionsZhHant}`),
  "## 開始前：基礎組句字",
  source.prerequisites.noteZhHant,
  ...source.prerequisites.wordGroups.map((group) => `### ${group.topicZhHant}\n\n${group.words.join(" · ")}\n\n${group.example.en}\n\n${group.example.zhHant}`),
  "## 基本文法",
  ...source.prerequisites.grammar.map((rule) => `### ${rule.topicZhHant}\n\n${rule.pattern}\n\n${rule.example.en}\n\n${rule.example.zhHant}`),
  "## 聽對話常見縮寫",
  bullets(source.prerequisites.contractions.map(({ short, full }) => `${short} = ${full}`)),
  "## 開始前自測",
  bullets(source.prerequisites.readinessCheckZhHant),
  "## 情境對答",
  source.speakingPractice.noteZhHant,
  ...source.speakingPractice.scenarios.map((scenario) => [
    `### ${scenario.titleZhHant}`,
    `核心字：${scenario.targetWords.join(" · ")}`,
    `情境補充字（另計，非完整生字清單）：${scenario.additionalWords.join(" · ") || "按個人需要補充"}`,
    ...scenario.dialogue.map((turn) => `**${turn.speaker}:** ${turn.en}\n\n${turn.zhHant}`),
    `**遮住答案再講：** ${scenario.taskZhHant}`,
    `**追問：** ${scenario.followUpQuestion}`,
    scenario.noteZhHant,
  ].join("\n\n")),
  "## 驗收：由識填到識講",
  bullets(source.studyPlan.selfCheckZhHant),
  source.studyPlan.progressRuleZhHant,
  source.studyPlan.nextStepZhHant,
  "## 教材同匯入版",
  "完整多義字、句型、片語、字形、前置知識及練習保留喺 spoken-english-core-400.json；網站匯入 spoken-english-core-400.import.json，只包含目前網站支援嘅欄位。網站例句按意思排列，中文解釋前標示所屬意思；每個意思至少兩句。其他教材欄位同自動口語評分仍未加入網站。",
  "檢查：`npm run spoken-core:check`；重建：`npm run spoken-core:build`。兩個指令都只喺本機處理，唔會上載。",
  "要發佈時另行執行：`npm run plan:upload -- content/learning-plans/spoken-english-core-400.import.json`。已有同 ID 計劃時，確認要覆寫先加 `--replace`。",
  "## 關於覆蓋率",
  "400 係詞頭數量，唔包含所有變化形式、片語、基礎字及情境補充字。本詞表未做語料覆蓋率測試，唔保證 95% 理解或表達能力。研究嘅詞彙覆蓋率亦唔等於口語流利度。",
  "[口語詞彙覆蓋研究（2022）](https://pmc.ncbi.nlm.nih.gov/articles/PMC8899723/)",
].join("\n\n") + "\n";

const outputs = [
  { name: "spoken-english-core-400.import.json", content: JSON.stringify(payload, null, 2) + "\n" },
  { name: "spoken-english-core-400-guide.md", content: guide },
];
for (const output of outputs) {
  const path = new URL(output.name, directory);
  if (args.includes("--check")) {
    assert.equal(await readFile(path, "utf8"), output.content, `${output.name} is stale; run npm run spoken-core:build.`);
  } else {
    await writeFile(path, output.content);
  }
}
console.log(`Verified ${source.entries.length} unique headwords, ${payload.entries.reduce((total, entry) => total + entry.examples.length, 0)} exported bilingual examples, ${source.entries.reduce((total, entry) => total + entry.uses.length, 0)} explained uses and 10 speaking scenarios.`);
console.log(`${args.includes("--check") ? "Checked" : "Generated"} import JSON and study guide from ${fileURLToPath(sourcePath)}. No data uploaded.`);
