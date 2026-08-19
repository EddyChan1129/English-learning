"use client";

import { useTranslation } from "react-i18next";
import { PARTS_OF_SPEECH, type PartOfSpeech } from "@/types";

export function WordMetadataFields({ selected, onSelectedChange, commonPhrases, onCommonPhrasesChange }: {
  selected: PartOfSpeech[];
  onSelectedChange: (parts: PartOfSpeech[]) => void;
  commonPhrases: string;
  onCommonPhrasesChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  function toggle(part: PartOfSpeech) {
    onSelectedChange(selected.includes(part)
      ? selected.filter((item) => item !== part)
      : [...selected, part]);
  }

  return (
    <div className="word-metadata-fields">
      <fieldset>
        <legend>{t("add.partsOfSpeech")}</legend>
        <p>{t("add.partsOfSpeechHint")}</p>
        <div className="part-of-speech-grid">
          {PARTS_OF_SPEECH.map((part) => (
            <label key={part} className={selected.includes(part) ? "selected" : ""}>
              <input type="checkbox" checked={selected.includes(part)} onChange={() => toggle(part)} />
              <span>{t(`partsOfSpeech.${part}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-bold">
        {t("add.commonPhrases")} <span className="font-normal text-[var(--muted)]">{t("add.onePerLine")}</span>
        <textarea
          className="field mt-2 min-h-24 resize-y"
          value={commonPhrases}
          onChange={(event) => onCommonPhrasesChange(event.target.value)}
          placeholder={t("add.commonPhrasesPlaceholder")}
        />
      </label>
    </div>
  );
}
