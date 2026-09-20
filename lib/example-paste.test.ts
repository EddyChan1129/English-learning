import test from "node:test";
import assert from "node:assert/strict";
import { parsePastedExamples } from "./example-paste.ts";

test("turns pasted Markdown example pairs into form rows", () => {
  assert.deepEqual(parsePastedExamples(`
**The company must ensure compliance with data protection laws.**\\
&#x20;公司必須確保**遵守**資料保障法例。

**Employees are required to follow the compliance policy.**\\
&#x20;員工需要遵守公司的**合規政策**。
\\
`), [
    {
      sentence: "The company must ensure compliance with data protection laws.",
      explanation: "公司必須確保遵守資料保障法例。",
    },
    {
      sentence: "Employees are required to follow the compliance policy.",
      explanation: "員工需要遵守公司的合規政策。",
    },
  ]);
});
