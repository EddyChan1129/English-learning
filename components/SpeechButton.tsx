"use client";

import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";

export function SpeechButton({ text, label, language }: { text: string; label?: string; language?: string }) {
  const { languagePreferences } = useApp();
  const { t } = useTranslation();
  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const speechLanguage = language ?? languagePreferences.learningLanguage;
    utterance.voice = voices.find((voice) => voice.lang.replace("_", "-") === speechLanguage)
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(speechLanguage.slice(0, 2).toLowerCase()))
      ?? null;
    utterance.lang = speechLanguage;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  const buttonLabel = label ?? t("common.listen");
  return <button type="button" onClick={speak} className="btn-secondary text-sm" aria-label={`${t("common.listen")}: ${text}`}>♪ {buttonLabel}</button>;
}
