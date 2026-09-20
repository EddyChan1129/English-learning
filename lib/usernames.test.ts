import assert from "node:assert/strict";
import test from "node:test";
import { normalizeUsername } from "./usernames.ts";

test("normalizes usernames for exact case-insensitive search", () => {
  assert.equal(normalizeUsername("  @User  Two  "), "user two");
  assert.equal(normalizeUsername("Ｅｄｄｙ"), "eddy");
});
