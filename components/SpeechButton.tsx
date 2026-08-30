"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { chooseSpeechVoice, getSpeechRate, hasPreferredSpeechVoice } from "@/lib/speech";

export function SpeechButton({ text, label, language }: { text: string; label?: string; language?: string }) {
  const { languagePreferences } = useApp();
  const { t } = useTranslation();
  const cancelPendingVoiceLoad = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    return () => cancelPendingVoiceLoad.current?.();
  }, []);

  function speak() {
    if (!("speechSynthesis" in window)) return;
    const synthesis = window.speechSynthesis;
    const speechLanguage = language ?? languagePreferences.learningLanguage;
    cancelPendingVoiceLoad.current?.();
    synthesis.cancel();

    function speakWithVoices(voices: readonly SpeechSynthesisVoice[]) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = chooseSpeechVoice(voices, speechLanguage);
      utterance.lang = speechLanguage;
      utterance.rate = getSpeechRate(speechLanguage);
      synthesis.speak(utterance);
    }

    const availableVoices = synthesis.getVoices();
    if (hasPreferredSpeechVoice(availableVoices, speechLanguage)) {
      speakWithVoices(availableVoices);
      return;
    }

    let finished = false;
    let fallbackTimer = 0;

    function cleanup() {
      synthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      window.clearTimeout(fallbackTimer);
      cancelPendingVoiceLoad.current = null;
    }

    function finish(voices: SpeechSynthesisVoice[]) {
      if (finished) return;
      finished = true;
      cleanup();
      speakWithVoices(voices);
    }

    function handleVoicesChanged() {
      const voices = synthesis.getVoices();
      if (hasPreferredSpeechVoice(voices, speechLanguage)) finish(voices);
    }

    synthesis.addEventListener("voiceschanged", handleVoicesChanged);
    fallbackTimer = window.setTimeout(() => finish(synthesis.getVoices()), 2500);
    cancelPendingVoiceLoad.current = cleanup;
    handleVoicesChanged();
  }

  const buttonLabel = label ?? t("common.listen");
  return <button type="button" onClick={speak} className="btn-secondary text-sm" aria-label={`${t("common.listen")}: ${text}`}>♪ {buttonLabel}</button>;
}
