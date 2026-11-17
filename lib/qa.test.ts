import { test } from "node:test";
import assert from "node:assert/strict";
import { runQa, countWords, readingEase } from "./qa";

test("countWords ignores markdown", () => {
  assert.equal(countWords("# Hello **world**\n\n- one [two](http://x.com)"), 4);
});

test("readingEase is higher for simple text", () => {
  const simple = "The cat sat. The dog ran. We had fun. It was a good day.";
  const hard = "Organizational transformation necessitates comprehensive multidisciplinary collaboration between interdependent stakeholders.";
  assert.ok(readingEase(simple) > readingEase(hard));
});

test("flags AI clichés, banned words, unsourced stats and missing CTA", () => {
  const r = runQa({
    body: "# Title\n\nLet's delve into this game-changer. Revenue grew 47% last year. Our synergy is great.",
    format: "linkedin_post",
    bannedWords: ["synergy"],
  });
  const by = Object.fromEntries(r.checks.map((c) => [c.id, c.status]));
  assert.equal(by.ai_phrases, "warn");
  assert.equal(by.banned_words, "fail");
  assert.equal(by.unsourced_stats, "warn");
  assert.equal(by.cta, "fail");
});

test("keyword check for blog", () => {
  const body = "# How to price SaaS\n\nPricing SaaS is hard. Here is how to price SaaS well.\n\n## A\n\n## B\n\n## C\n\n## D\n\nBook a call.";
  const r = runQa({ body, format: "blog", keyword: "price saas" });
  const kw = r.checks.find((c) => c.id === "keyword")!;
  assert.equal(kw.status, "pass");
  assert.equal(r.checks.find((c) => c.id === "structure")!.status, "pass");
});

test("email sequence structure", () => {
  const one = (n: number) => `## Email ${n} — send on day ${n}\n**Subject:** s${n}\nBody. Reply here [link]\n`;
  const r = runQa({ body: [1, 2, 3, 4, 5].map(one).join("\n"), format: "email_sequence" });
  assert.equal(r.checks.find((c) => c.id === "structure")!.status, "pass");
});
