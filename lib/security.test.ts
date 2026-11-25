import { test } from "node:test";
import assert from "node:assert/strict";
import { normEmail, passwordError, safeEqual } from "./security";
import { keywordRegex } from "./qa";

test("lookalike emails collapse to one canonical form (Unicode / 'Spotify' attack)", () => {
  assert.equal(normEmail("Ｂｏｂ@Example.com"), "bob@example.com"); // fullwidth letters
  assert.equal(normEmail("  BOB@example.COM "), "bob@example.com");
  assert.equal(normEmail(normEmail("Ｂｏｂ@example.com")), normEmail("Ｂｏｂ@example.com")); // idempotent
});

test("passwords: 8 to 72 bytes (bcrypt ignores anything past 72)", () => {
  assert.ok(passwordError("short"));
  assert.equal(passwordError("a-good-password"), null);
  assert.ok(passwordError("x".repeat(73)));
  assert.ok(passwordError("é".repeat(37))); // 74 bytes
});

test("safeEqual compares in constant time and still compares correctly", () => {
  assert.equal(safeEqual("Bearer abc", "Bearer abc"), true);
  assert.equal(safeEqual("Bearer abc", "Bearer abd"), false);
  assert.equal(safeEqual("", "Bearer abc"), false);
});

test("keyword regex stays fast on hostile input (ReDoS)", () => {
  const re = keywordRegex("spring lawn care tips denver suburbs");
  const hostile = "spring" + " ".repeat(50_000) + "!";
  const start = performance.now();
  re.lastIndex = 0;
  re.test(hostile);
  const ms = performance.now() - start;
  assert.ok(ms < 200, `took ${ms.toFixed(0)}ms`);
  re.lastIndex = 0;
  assert.ok(re.test("Spring lawn care tips for Denver suburbs"));
});
