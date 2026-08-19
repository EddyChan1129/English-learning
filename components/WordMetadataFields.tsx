"use client";

import { useTranslation } from "react-i18next";
import { PARTS_OF_SPEECH, type PartOfSpeech } from "@/types";

type WordMetadataFieldsProps = {
  selected: PartOfSpeech[];
  onSelectedChange: (parts: PartOfSpeech[]) => void;
  commonPhrases: string;
  onCommonPhrasesChange: (value: string) => void;
};

export function WordMetadataFields({
  selected,
  onSelectedChange,
  commonPhrases,
  onCommonPhrasesChange,
}: WordMetadataFieldsProps) {
  const { t } = useTranslation();

  function toggle(part: PartOfSpeech) {
    onSelectedChange(selected.includes(part)
      ? selected.filter((item) => item !== part)
      : [...selected, part]);
  }

  return (
    <div className="word-metadata-fields">
      <fieldset>
        <legend>
          {t("add.partsOfSpeech")}
          <RequiredMark />
        </legend>
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

      <div className="desktop-common-phrases">
        <CommonPhrasesField value={commonPhrases} onChange={onCommonPhrasesChange} />
      </div>

      <details className="mobile-common-phrases">
        <summary>
          <span>{t("add.commonPhrases")}</span>
          <small className="optional-badge">{t("add.optional")}</small>
        </summary>
        <CommonPhrasesField value={commonPhrases} onChange={onCommonPhrasesChange} compact />
      </details>
    </div>
  );
}

export function RequiredMark() {
  const { t } = useTranslation();
  return <span className="required-mark" aria-label={t("common.required")} title={t("common.required")}>*</span>;
}

function CommonPhrasesField({ value, onChange, compact = false }: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <label className="block text-sm font-bold">
      <span className={compact ? "sr-only" : "field-label-row"}>
        <span>{t("add.commonPhrases")} <span className="font-normal text-[var(--muted)]">{t("add.onePerLine")}</span></span>
        <span className="optional-badge">{t("add.optional")}</span>
      </span>
      <small className="field-help">{t("add.commonPhrasesHint")}</small>
      <textarea
        className="field mt-2 min-h-24 resize-y"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("add.commonPhrasesPlaceholder")}
      />
    </label>
  );
}
