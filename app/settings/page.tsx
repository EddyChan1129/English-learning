"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { GuestDataPanel } from "@/components/GuestDataPanel";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { TargetForm } from "@/components/TargetForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLanguageName, LANGUAGE_OPTIONS } from "@/lib/languages";
import { setMuted, useMuted } from "@/lib/sound-settings";
import { setDarkMode, useDarkMode } from "@/lib/theme";
import type { LanguagePreferences, SupportedLanguageCode } from "@/types";

export default function SettingsPage() {
  const {
    target,
    targetLoaded,
    vocabularyCategories,
    languagePreferences,
    languagePreferencesLoaded,
    createVocabularyCategory,
    saveLearningTarget,
    updateLanguagePreferences,
  } = useApp();
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const darkMode = useDarkMode();
  const muted = useMuted();
  const { t } = useTranslation();

  async function createCategory() {
    setCategoryError("");
    try {
      await createVocabularyCategory(categoryName);
      setCategoryName("");
    } catch {
      setCategoryError(t("categories.createError"));
    }
  }

  return (
    <div className="settings-page animate-rise">
      <header className="settings-heading">
        <p className="eyebrow">{t("settings.eyebrow")}</p>
        <h1 className="page-title">{t("settings.title")}</h1>
        <p>{t("settings.description")}</p>
      </header>

      <GuestDataPanel />
      <div className="settings-grid">
        <Card className="settings-card">
          <div>
            <h2>{t("settings.appearance")}</h2>
            <p>{t("settings.appearanceHint")}</p>
          </div>
          <button
            type="button"
            className={`theme-switch ${darkMode ? "active" : ""}`}
            role="switch"
            aria-checked={darkMode}
            onClick={() => setDarkMode(!darkMode)}
          >
            <span aria-hidden="true">{darkMode ? "☾" : "☀"}</span>
            <strong>{t(darkMode ? "settings.darkMode" : "settings.lightMode")}</strong>
            <i aria-hidden="true" />
          </button>
        </Card>

        <Card className="settings-card">
          <div>
            <h2>{t("settings.language")}</h2>
            <p>{t("settings.languageHint")}</p>
          </div>
          <LanguageSwitcher />
        </Card>

        <Card className="settings-card">
          <div>
            <h2>{t("settings.muteMode")}</h2>
            <p>{t("settings.muteHint")}</p>
          </div>
          <button
            type="button"
            className={`theme-switch ${muted ? "active" : ""}`}
            role="switch"
            aria-label={t("settings.muteMode")}
            aria-checked={muted}
            onClick={() => setMuted(!muted)}
          >
            <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
            <strong>{t(muted ? "settings.muted" : "settings.soundOn")}</strong>
            <i aria-hidden="true" />
          </button>
        </Card>

        {languagePreferencesLoaded ? (
          <LanguagePreferencesForm
            key={`${languagePreferences.learningLanguage}-${languagePreferences.explanationLanguage}`}
            initial={languagePreferences}
            onSave={updateLanguagePreferences}
          />
        ) : null}

        <div className="settings-target-form">
          {targetLoaded
            ? <TargetForm key={JSON.stringify(target)} initial={target} onSave={saveLearningTarget} />
            : <p className="settings-empty">{t("home.loading")}</p>}
        </div>

        <Card className="settings-card settings-categories-card">
          <div>
            <h2>{t("settings.categories")}</h2>
            <p>{t("settings.categoriesHint")}</p>
          </div>
          {vocabularyCategories.length ? (
            <div className="settings-category-list" aria-label={t("categories.label")}>
              {vocabularyCategories.map((category) => <span key={category}>{category}</span>)}
            </div>
          ) : <p className="settings-empty">{t("settings.noCategories")}</p>}
          <div className="settings-category-create">
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && categoryName.trim()) {
                  event.preventDefault();
                  void createCategory();
                }
              }}
              maxLength={40}
              placeholder={t("categories.placeholder")}
              aria-label={t("categories.newCategory")}
            />
            <Button type="button" variant="outline" disabled={!categoryName.trim()} onClick={() => void createCategory()}>
              ＋ {t("categories.create")}
            </Button>
          </div>
          {categoryError ? <small className="category-error" role="alert">{categoryError}</small> : null}
        </Card>
      </div>
    </div>
  );
}

function LanguagePreferencesForm({ initial, onSave }: {
  initial: LanguagePreferences;
  onSave: (preferences: LanguagePreferences) => Promise<void>;
}) {
  const [learningLanguage, setLearningLanguage] = useState(initial.learningLanguage);
  const [explanationLanguage, setExplanationLanguage] = useState(initial.explanationLanguage);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const { i18n, t } = useTranslation();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      await onSave({ learningLanguage, explanationLanguage });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="settings-language-card">
      <form onSubmit={submit} aria-busy={busy}>
        <div>
          <h2>{t("settings.studyLanguages")}</h2>
          <p>{t("settings.studyLanguagesHint")}</p>
        </div>
        <div className="settings-language-fields">
          <label>
            <span>{t("settings.learningLanguage")}</span>
            <select value={learningLanguage} onChange={(event) => setLearningLanguage(event.target.value as SupportedLanguageCode)}>
              {LANGUAGE_OPTIONS.map(({ code }) => <option key={code} value={code}>{getLanguageName(code, i18n.resolvedLanguage)}</option>)}
            </select>
          </label>
          <label>
            <span>{t("settings.explanationLanguage")}</span>
            <select value={explanationLanguage} onChange={(event) => setExplanationLanguage(event.target.value as SupportedLanguageCode)}>
              {LANGUAGE_OPTIONS.map(({ code }) => <option key={code} value={code}>{getLanguageName(code, i18n.resolvedLanguage)}</option>)}
            </select>
          </label>
        </div>
        <div className="settings-language-actions">
          <Button disabled={busy}>{busy ? t("common.saving") : t("settings.saveLanguages")}</Button>
          {saved ? <span role="status">✓ {t("settings.languagesSaved")}</span> : null}
        </div>
      </form>
    </Card>
  );
}
