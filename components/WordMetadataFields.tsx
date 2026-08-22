"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PARTS_OF_SPEECH, type PartOfSpeech } from "@/types";

type WordMetadataFieldsProps = {
  selected: PartOfSpeech[];
  languageName: string;
  onSelectedChange: (parts: PartOfSpeech[]) => void;
  children?: ReactNode;
};

export function WordMetadataFields({
  selected,
  languageName,
  onSelectedChange,
  children,
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
          {t("add.partsOfSpeech", { language: languageName })}
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
      {children}
    </div>
  );
}

export function AdvancedWordFields({ synonyms, onSynonymsChange, commonPhrases, onCommonPhrasesChange }: {
  synonyms: string;
  onSynonymsChange: (value: string) => void;
  commonPhrases: string;
  onCommonPhrasesChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <details className="advanced-word-fields">
      <summary>
        <span>{t("add.advanced")}</span>
        <small>{t("add.advancedHint")}</small>
      </summary>
      <div className="advanced-word-fields-content">
        <label className="block text-sm font-bold">
          <span className="field-label-row">
            <span>{t("add.synonyms")} <span className="font-normal text-[var(--muted)]">{t("add.commaSeparated")}</span></span>
            <span className="optional-badge">{t("add.optional")}</span>
          </span>
          <input className="field mt-2" value={synonyms} onChange={(event) => onSynonymsChange(event.target.value)} placeholder={t("add.synonymsPlaceholder")} />
        </label>
        <CommonPhrasesField value={commonPhrases} onChange={onCommonPhrasesChange} />
      </div>
    </details>
  );
}

export function RequiredMark() {
  const { t } = useTranslation();
  return <span className="required-mark" aria-label={t("common.required")} title={t("common.required")}>*</span>;
}

function CommonPhrasesField({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <label className="block text-sm font-bold">
      <span className="field-label-row">
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
