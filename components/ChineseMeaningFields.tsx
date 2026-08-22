"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RequiredMark } from "./WordMetadataFields";

export function ChineseMeaningFields({ values, languageName, onChange }: {
  values: string[];
  languageName: string;
  onChange: (values: string[]) => void;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex min-h-8 items-center justify-between gap-3">
        <strong className="text-sm">{t("add.chineseMeanings", { language: languageName })}<RequiredMark /></strong>
        {values.length < 3 ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onChange([...values, ""])}
            aria-label={t("add.addChineseMeaning", { language: languageName })}
            title={t("add.addChineseMeaning", { language: languageName })}
            className="text-lg font-black"
          >
            +
          </Button>
        ) : null}
      </div>
      {values.map((value, index) => (
        <div key={index} className="flex items-end gap-2">

          <input
            className="field mt-1"
            required
            value={value}
            onChange={(event) => onChange(values.map((item, position) => position === index ? event.target.value : item))}
            placeholder={t(index === 0 ? "add.meaningFirstPlaceholder" : "add.chineseMeaningPlaceholder", { language: languageName })}
          />
          {index > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(values.filter((_, position) => position !== index))}
              aria-label={t("add.removeChineseMeaning", { number: index + 1, language: languageName })}
              title={t("add.removeChineseMeaning", { number: index + 1, language: languageName })}
              className="text-lg text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              −
            </Button>
          ) : null}
        </div>
      ))}

    </div >
  );
}
