"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RequiredMark } from "./WordMetadataFields";

export function ChineseMeaningFields({ values, onChange }: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex min-h-8 items-center justify-between gap-3">
        <strong className="text-sm">{t("add.chineseMeanings")}<RequiredMark /></strong>
        {values.length < 3 ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onChange([...values, ""])}
            aria-label={t("add.addChineseMeaning")}
            title={t("add.addChineseMeaning")}
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
            placeholder={index === 0 ? "以前是；曾經是" : t("add.chineseMeaningPlaceholder")}
          />
          {index > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(values.filter((_, position) => position !== index))}
              aria-label={t("add.removeChineseMeaning", { number: index + 1 })}
              title={t("add.removeChineseMeaning", { number: index + 1 })}
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
