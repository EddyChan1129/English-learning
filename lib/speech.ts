type VoiceLike = { name: string; lang: string };

const normalizeLanguage = (language: string) => language.replace("_", "-").toLowerCase();

export function getSpeechRate(language: string): number {
  return normalizeLanguage(language).startsWith("en") ? 0.78 : 1;
}

export function hasPreferredSpeechVoice<Voice extends VoiceLike>(voices: readonly Voice[], language: string): boolean {
  const normalizedLanguage = normalizeLanguage(language);

  if (normalizedLanguage === "en-us") {
    return voices.some((voice) => (
      normalizeLanguage(voice.lang) === normalizedLanguage
      && voice.name.toLowerCase().includes("google")
    ));
  }

  return chooseSpeechVoice(voices, language) !== null;
}

export function chooseSpeechVoice<Voice extends VoiceLike>(voices: readonly Voice[], language: string): Voice | null {
  const normalizedLanguage = normalizeLanguage(language);
  const exactLanguage = (voice: Voice) => normalizeLanguage(voice.lang) === normalizedLanguage;
  const languageFamily = language.slice(0, 2).toLowerCase();

  if (normalizedLanguage === "en-us") {
    return voices.find((voice) => voice.name === "Google US English")
      ?? voices.find((voice) => exactLanguage(voice) && voice.name.toLowerCase().includes("google"))
      ?? ["Samantha", "Aaron", "Alex"].map((name) => voices.find((voice) => exactLanguage(voice) && voice.name === name)).find(Boolean)
      ?? voices.find(exactLanguage)
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(languageFamily))
      ?? null;
  }

  return voices.find((voice) => exactLanguage(voice) && voice.name.toLowerCase().includes("google"))
    ?? voices.find(exactLanguage)
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(languageFamily))
    ?? null;
}
