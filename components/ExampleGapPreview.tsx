import { useTranslation } from "react-i18next";
import { makeGapQuestion } from "@/lib/test-helpers";

export function ExampleGapPreview({ sentence, word }: { sentence: string; word: string }) {
  const { t } = useTranslation();
  if (!sentence.trim() || !word.trim()) return null;
  const gap = makeGapQuestion(sentence, word);
  const matched = gap.sentence !== sentence;
  return (
    <p className={`mt-2 text-sm ${matched ? "text-[var(--muted)]" : "text-amber-700"}`} role="status">
      {matched ? t("add.gapPreview", { sentence: gap.sentence }) : t("add.gapUnmatched")}
    </p>
  );
}
