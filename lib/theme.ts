"use client";

import { useSyncExternalStore } from "react";

export const THEME_STORAGE_KEY = "fowl-to-phoenix.theme.v1";
const THEME_CHANGE_EVENT = "fowl-to-phoenix:theme-change";

function getSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

export function useDarkMode() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function setDarkMode(enabled: boolean) {
  const theme = enabled ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}
