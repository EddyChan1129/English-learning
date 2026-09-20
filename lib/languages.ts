import type { LanguagePreferences, SupportedLanguageCode } from "@/types";

export const LANGUAGE_OPTIONS: ReadonlyArray<{
  code: SupportedLanguageCode;
  en: string;
  zh: string;
}> = [
  { code: "en-US", en: "English", zh: "英文" },
  { code: "zh-HK", en: "Cantonese Chinese", zh: "粵語中文" },
  { code: "zh-CN", en: "Mandarin Chinese", zh: "普通話中文" },
  { code: "fr-FR", en: "French", zh: "法文" },
  { code: "es-ES", en: "Spanish", zh: "西班牙文" },
  { code: "de-DE", en: "German", zh: "德文" },
  { code: "ja-JP", en: "Japanese", zh: "日文" },
  { code: "ko-KR", en: "Korean", zh: "韓文" },
];

export const DEFAULT_LANGUAGE_PREFERENCES: LanguagePreferences = {
  learningLanguage: "en-US",
  explanationLanguage: "zh-HK",
};

const supportedCodes = new Set(LANGUAGE_OPTIONS.map(({ code }) => code));

export function normalizeLanguagePreferences(value: unknown): LanguagePreferences {
  const data = value && typeof value === "object" ? value as Partial<LanguagePreferences> : {};
  return {
    learningLanguage: isSupportedLanguage(data.learningLanguage)
      ? data.learningLanguage
      : DEFAULT_LANGUAGE_PREFERENCES.learningLanguage,
    explanationLanguage: isSupportedLanguage(data.explanationLanguage)
      ? data.explanationLanguage
      : DEFAULT_LANGUAGE_PREFERENCES.explanationLanguage,
  };
}

export function getLanguageName(code: SupportedLanguageCode, interfaceLanguage?: string) {
  const option = LANGUAGE_OPTIONS.find((language) => language.code === code) ?? LANGUAGE_OPTIONS[0];
  return interfaceLanguage?.startsWith("zh") ? option.zh : option.en;
}

function isSupportedLanguage(value: unknown): value is SupportedLanguageCode {
  return typeof value === "string" && supportedCodes.has(value as SupportedLanguageCode);
}
