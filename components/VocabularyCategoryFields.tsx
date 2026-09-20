"use client";

import { useTranslation } from "react-i18next";

export function VocabularyCategoryFields({ categories, selected, onSelectedChange }: {
  categories: string[];
  selected: string[];
  onSelectedChange: (categories: string[]) => void;
}) {
  const { t } = useTranslation();

  function toggle(category: string) {
    onSelectedChange(selected.includes(category)
      ? selected.filter((item) => item !== category)
      : [...selected, category]);
  }

  if (!categories.length) return null;

  return (
    <fieldset className="category-fields">
      <legend>{t("categories.label")} <span className="optional-badge">{t("add.optional")}</span></legend>
      <p>{t("categories.hint")}</p>
      <div className="part-of-speech-grid">{categories.map((category) => (
        <label key={category} className={selected.includes(category) ? "selected" : ""}>
          <input type="checkbox" checked={selected.includes(category)} onChange={() => toggle(category)} />
          <span>{category}</span>
        </label>
      ))}</div>
    </fieldset>
  );
}
