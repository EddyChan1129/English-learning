"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { isMuted, useMuted } from "@/lib/sound-settings";
import { chooseSpeechVoice, getSpeechRate, hasPreferredSpeechVoice } from "@/lib/speech";

export function SpeechButton({ text, label, language, iconOnly = false, className = "", shortcut }: {
  shortcut?: string;
  text: string;
  label?: string;
  language?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const { languagePreferences } = useApp();
  const { t } = useTranslation();
  const muted = useMuted();
  const cancelPendingVoiceLoad = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    return () => cancelPendingVoiceLoad.current?.();
  }, []);

  useEffect(() => {
    if (muted) cancelPendingVoiceLoad.current?.();
  }, [muted]);

  function speak() {
    if (isMuted() || !("speechSynthesis" in window)) return;
    const synthesis = window.speechSynthesis;
    const speechLanguage = language ?? languagePreferences.learningLanguage;
    cancelPendingVoiceLoad.current?.();
    synthesis.cancel();

    function speakWithVoices(voices: readonly SpeechSynthesisVoice[]) {
      if (isMuted()) return;
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
    cancelPendingVoiceLoad.current = () => {
      finished = true;
      cleanup();
    };
    handleVoicesChanged();
  }

  const buttonLabel = label ?? t("common.listen");
  const accessibleLabel = `${t("common.listen")}: ${text}`;
  return <button type="button" onClick={speak} disabled={muted} className={`${iconOnly ? "speech-icon-button" : "btn-secondary text-sm"} ${iconOnly && shortcut ? "speech-icon-shortcut" : ""} ${className}`} aria-label={accessibleLabel} aria-keyshortcuts={shortcut} title={shortcut ? `${accessibleLabel} (${shortcut})` : accessibleLabel}>♪{iconOnly ? null : ` ${buttonLabel}`}{shortcut ? <kbd className="ml-1 text-xs opacity-60">({shortcut})</kbd> : null}</button>;
}
