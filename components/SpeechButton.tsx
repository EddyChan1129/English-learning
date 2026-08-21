"use client";

import { useTranslation } from "react-i18next";

export function SpeechButton({ text, label }: { text: string; label?: string }) {
  const { t } = useTranslation();
  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.name === "Google US English")
      ?? voices.find((voice) => voice.lang.replace("_", "-") === "en-US")
      ?? null;
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  const buttonLabel = label ?? t("common.listen");
  return <button type="button" onClick={speak} className="btn-secondary text-sm" aria-label={`${t("common.listen")}: ${text}`}>♪ {buttonLabel}</button>;
}
