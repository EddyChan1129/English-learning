import assert from "node:assert/strict";
import test from "node:test";
import { shuffled } from "./test-helpers.ts";

test("shuffles a copy without changing the source list", () => {
  const source = [1, 2, 3, 4];

  assert.deepEqual(shuffled(source, () => 0), [2, 3, 4, 1]);
  assert.deepEqual(source, [1, 2, 3, 4]);
});
