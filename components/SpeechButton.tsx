"use client";

import { useTranslation } from "react-i18next";

export function SpeechButton({ text, label }: { text: string; label?: string }) {
  const { t } = useTranslation();
  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  const buttonLabel = label ?? t("common.listen");
  return <button type="button" onClick={speak} className="btn-secondary text-sm" aria-label={`${t("common.listen")}: ${text}`}>♪ {buttonLabel}</button>;
}
