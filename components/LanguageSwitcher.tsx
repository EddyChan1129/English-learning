"use client";

import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const chinese = i18n.resolvedLanguage === "zh-HK";

  function changeLanguage(language: "en" | "zh-HK") {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    void i18n.changeLanguage(language);
  }

  return (
    <div className="language-switcher" role="group" aria-label={t("nav.language")}>
      <button className={chinese ? "" : "active"} onClick={() => changeLanguage("en")} aria-pressed={!chinese}>EN</button>
      <button className={chinese ? "active" : ""} onClick={() => changeLanguage("zh-HK")} aria-pressed={chinese}>中</button>
    </div>
  );
}
