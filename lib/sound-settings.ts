"use client";

import { useSyncExternalStore } from "react";

export const MUTE_STORAGE_KEY = "fowl-to-phoenix.muted.v1";
const MUTE_CHANGE_EVENT = "fowl-to-phoenix:mute-change";
let fallbackMuted = false;

export function isMuted() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return fallbackMuted;
  }
}

export function subscribeToMute(callback: () => void) {
  function handleChange() {
    if (isMuted() && "speechSynthesis" in window) window.speechSynthesis.cancel();
    callback();
  }
  function handleStorage(event: StorageEvent) {
    if (event.key === MUTE_STORAGE_KEY || event.key === null) handleChange();
  }
  window.addEventListener(MUTE_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(MUTE_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useMuted() {
  return useSyncExternalStore(subscribeToMute, isMuted, () => false);
}

export function setMuted(enabled: boolean) {
  fallbackMuted = enabled;
  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(enabled));
  } catch {
    // Keep the preference for this session when browser storage is unavailable.
  }
  if (enabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
  window.dispatchEvent(new Event(MUTE_CHANGE_EVENT));
}
