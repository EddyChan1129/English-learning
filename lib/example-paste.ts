export type PastedExample = { sentence: string; explanation: string };

export function parsePastedExamples(text: string): PastedExample[] {
  const lines = text
    .split(/\r?\n/)
    .map(cleanPastedLine)
    .filter(Boolean);

  if (lines.length < 2) return [];

  return Array.from({ length: Math.min(4, Math.ceil(lines.length / 2)) }, (_, index) => ({
    sentence: lines[index * 2],
    explanation: lines[index * 2 + 1] ?? "",
  }));
}

function cleanPastedLine(line: string) {
  return line
    .trim()
    .replace(/\\+$/, "")
    .replace(/^(?:&#x20;|&#32;|&nbsp;)\s*/i, "")
    .replaceAll("**", "")
    .trim();
}
