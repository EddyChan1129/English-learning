"use client";

export function SpeechButton({ text, label = "Listen" }: { text: string; label?: string }) {
  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  return <button type="button" onClick={speak} className="btn-secondary text-sm" aria-label={`Listen to ${text}`}>♪ {label}</button>;
}
