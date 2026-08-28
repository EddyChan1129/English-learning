export function normalizeUsername(value: string) {
  return value.normalize("NFKC").trim().replace(/^@/, "").replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}
