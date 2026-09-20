import assert from "node:assert/strict";
import test from "node:test";
import { getMissingVerbEnding, getSpellingHint, getSpellingHintCharacters, getVerbEndingHint, isWordAnswerCorrect, makeGapQuestion, makeGapSentence, makeWordTestQuestion, maskTestAnswer, shuffled } from "./test-helpers.ts";

test("masks every answer in vocabulary meanings while preserving the explanation", () => {
  const meaning = "逐漸習慣；句式：get used to + 名詞/doing；to 係介詞；GET USED TO doing 係逐漸習慣，be used to doing 係已經習慣。";
  assert.equal(maskTestAnswer(meaning, "get used to"),
    "逐漸習慣；句式：_____ + 名詞/doing；to 係介詞；_____ doing 係逐漸習慣，be used to doing 係已經習慣。");
  assert.equal(maskTestAnswer("get used to / gets used to / got used to", "get used to", "got used to"), "_____ / _____ / _____");
  assert.equal(maskTestAnswer("相信；believe in；believed in；unbelievable", "believe"), "相信；_____ in；_____ in；unbelievable");
  assert.equal(maskTestAnswer("be used to / are used to", "be used to", "are used to"), "_____ / _____");
  assert.equal(maskTestAnswer("con ... out of；conned her out of money", "con ... out of", "conned out of"), "_____；_____ her _____ money");
  assert.equal(maskTestAnswer("逐漸習慣", "get used to"), "逐漸習慣");
  assert.equal(maskTestAnswer("unchanged", ""), "unchanged");
});

test("supports multi-word targets in gap-fill tests", () => {
  assert.equal(makeGapSentence("I used to be very shy.", "used to be"), "I _____ very shy.");
  assert.equal(isWordAnswerCorrect("Managed to", "managed to"), true);
});

test("uses the complete inflected word as the gap answer", () => {
  assert.deepEqual(
    makeGapQuestion("The system was breached by hackers.", "breach"),
    { sentence: "The system was _____ by hackers.", answer: "breached" },
  );
  assert.equal(isWordAnswerCorrect("breached", makeGapQuestion("The system was breached.", "breach").answer), true);
});

test("identifies regular verb endings without flagging an unchanged root", () => {
  assert.equal(getVerbEndingHint("uses", "use"), "s");
  assert.equal(getVerbEndingHint("studies", "study"), "s");
  assert.equal(getVerbEndingHint("breached", "breach"), "ed");
  assert.equal(getVerbEndingHint("tried", "try"), "ed");
  assert.equal(getVerbEndingHint("pass", "pass"), null);
  assert.equal(getVerbEndingHint("went", "go"), null);
  assert.equal(getVerbEndingHint("led", "lead"), null);
});

test("accepts only a missing regular s or ed ending", () => {
  assert.equal(getMissingVerbEnding("use", "uses"), "s");
  assert.equal(getMissingVerbEnding("study", "studies"), "s");
  assert.equal(getMissingVerbEnding("breach", "breached"), "ed");
  assert.equal(getMissingVerbEnding("try", "tried"), "ed");
  assert.equal(getMissingVerbEnding("chicken out", "chickened out"), "ed");
  assert.equal(getMissingVerbEnding("chicken in", "chickened out"), null);
  assert.equal(getMissingVerbEnding("brech", "breached"), null);
  assert.equal(getMissingVerbEnding("build in", "built in"), null);
  assert.equal(getMissingVerbEnding("lead", "led"), null);
  assert.equal(getMissingVerbEnding("go", "went"), null);
});

test("finds regular, irregular, and slash alternatives in phrasal-verb examples", () => {
  assert.deepEqual(
    makeGapQuestion("Grace chickened out before it was her turn.", "Chicken Out"),
    { sentence: "Grace _____ before it was her turn.", answer: "chickened out" },
  );
  assert.deepEqual(
    makeGapQuestion("The shelving was built in.", "Build In/Into"),
    { sentence: "The shelving was _____.", answer: "built in" },
  );
});

test("uses common core-word irregular forms as quiz answers", () => {
  for (const [word, sentence, answer] of [
    ["find", "She found a restaurant.", "found"],
    ["mean", "I meant to call you.", "meant"],
    ["grow", "The baby has grown.", "grown"],
    ["grow", "It grew dark.", "grew"],
    ["become", "It became cold.", "became"],
    ["write", "She wrote an email.", "wrote"],
    ["lose", "I lost my wallet.", "lost"],
    ["meet", "I met my teacher.", "met"],
    ["spend", "She spent too much.", "spent"],
    ["win", "Our team won.", "won"],
    ["buy", "She bought shoes.", "bought"],
    ["send", "I sent the email.", "sent"],
    ["choose", "She chose blue.", "chose"],
    ["forget", "I forgot my bag.", "forgot"],
    ["lend", "She lent me a pen.", "lent"],
    ["be", "They are ready.", "are"],
    ["have", "She has a car.", "has"],
  ]) {
    const question = makeGapQuestion(sentence, word);
    assert.equal(question.answer, answer);
    assert.equal(question.sentence, sentence.replace(answer, "_____"));
  }
});

test("keeps the matching translation and full sentence with a gap-fill question", () => {
  assert.deepEqual(makeWordTestQuestion({
    word: "mop",
    sentences: ["This sentence has no target.", "Use the mop to clean the wet floor."],
    sentenceExplanations: ["呢句冇目標字。", "用地拖清潔濕咗嘅地板。"],
  }), {
    sentence: "Use the _____ to clean the wet floor.",
    answer: "mop",
    sourceSentence: "Use the mop to clean the wet floor.",
    translation: "用地拖清潔濕咗嘅地板。",
  });
});

test("randomly chooses from every example containing the target word", () => {
  const word = {
    word: "mop",
    sentences: ["Use the mop on the floor.", "This sentence has no target.", "The mop is beside the bucket."],
    sentenceExplanations: ["用地拖清潔地板。", "呢句冇目標字。", "地拖喺水桶旁邊。"],
  };

  assert.equal(makeWordTestQuestion(word, () => 0).sourceSentence, "Use the mop on the floor.");
  assert.equal(makeWordTestQuestion(word, () => 0.999).sourceSentence, "The mop is beside the bucket.");
  assert.equal(makeWordTestQuestion(word, () => 0.999).translation, "地拖喺水桶旁邊。");
});

test("shuffles a copy without changing the source list", () => {
  const source = [1, 2, 3, 4];

  assert.deepEqual(shuffled(source, () => 0), [2, 3, 4, 1]);
  assert.deepEqual(source, [1, 2, 3, 4]);
});

test("final-test spelling hints reveal only the first letter for five or more letters", () => {
  assert.equal(getSpellingHint("compensate"), "c _ _ _ _ _ _ _ _ _");
  assert.equal(getSpellingHint("dog"), "_ _ _");
  assert.equal(getSpellingHint("four"), "_ _ _ _");
  assert.equal(getSpellingHint("apple"), "a _ _ _ _");
  assert.equal(getSpellingHint("A"), "_");
  assert.equal(getSpellingHint("used to be"), "u _ _ _   _ _   _ _");
});

test("marks each hidden spelling position as the user types", () => {
  assert.deepEqual(
    getSpellingHintCharacters("user", "us").map(({ character, state }) => `${character}:${state}`),
    ["u:shown", "_:correct", "_:pending", "r:shown"],
  );
  assert.equal(getSpellingHintCharacters("user", "ux")[1].state, "incorrect");
});

test("blanks separated inflected phrasal verbs while keeping their object", () => {
  assert.deepEqual(makeGapQuestion("Heather conned me out of my last piece of gum.", "Con Out Of"), {
    sentence: "Heather _____ me _____ my last piece of gum.", answer: "conned out of",
  });
  assert.equal(makeGapQuestion("The carpet is clean.", "car").sentence, "The carpet is clean.");
});

test("falls back to a meaning question when imported examples have no target", () => {
  assert.deepEqual(makeWordTestQuestion({ word: "con out of", sentences: ["An unrelated example."], sentenceExplanations: ["無關例句"] }), {
    sentence: "", answer: "con out of", sourceSentence: "", translation: "",
  });
});

test("matches explicit ellipsis slots and preserves pronoun or noun objects", () => {
  for (const target of ["con ... out of", "CON … OUT OF", "con...out of"]) {
    for (const object of ["me", "her", "the old lady"]) {
      assert.deepEqual(makeGapQuestion(`Heather conned ${object} out of my last piece of gum.`, target), {
        sentence: `Heather _____ ${object} _____ my last piece of gum.`, answer: "conned out of",
      });
    }
  }
  assert.deepEqual(makeGapQuestion("They took the old coat off.", "take ... off"), {
    sentence: "They _____ the old coat _____.", answer: "took off",
  });
  assert.deepEqual(makeGapQuestion("She put the news down to bad luck.", "put ... down to"), {
    sentence: "She _____ the news _____ bad luck.", answer: "put down to",
  });
});

test("does not match unrelated words, missing objects or across punctuation", () => {
  for (const sentence of ["Heather comforted me out of kindness.", "Heather conned out of gum.", "Heather conned me. Out of gum, I left.", "Heather conned me; out of gum, I left.", "Heather conned me out, of course."]) {
    assert.equal(makeGapQuestion(sentence, "con ... out of").sentence, sentence);
  }
});

test("ellipsis questions keep the right translation and answers omit the notation", () => {
  assert.deepEqual(makeWordTestQuestion({
    word: "con … out of", sentences: ["Unrelated.", "A fake charity conned her out of thousands of dollars."],
    sentenceExplanations: ["無關。", "假慈善機構呃走佢幾千蚊。"],
  }), {
    sentence: "A fake charity _____ her _____ thousands of dollars.", answer: "conned out of",
    sourceSentence: "A fake charity conned her out of thousands of dollars.", translation: "假慈善機構呃走佢幾千蚊。",
  });
  assert.equal(isWordAnswerCorrect("con out of", "con … out of"), true);
  assert.equal(makeWordTestQuestion({word: "con ... out of", sentences: [], sentenceExplanations: []}).answer, "con out of");
});
