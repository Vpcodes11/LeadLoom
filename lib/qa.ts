import { FORMATS, type Format } from "./formats";

export type QaCheck = { id: string; label: string; status: "pass" | "warn" | "fail"; detail: string };
export type QaReport = { score: number; words: number; readingEase: number; checks: QaCheck[] };

/** Phrases that make copy sound machine-written. Matched case-insensitively. */
export const AI_CLICHES = [
  "delve", "in today's fast-paced", "in today's digital", "ever-evolving", "game-changer", "game changer",
  "unlock the power", "unleash", "elevate your", "seamless", "tapestry", "navigate the complexities",
  "it's important to note", "it is important to note", "in conclusion", "look no further", "embark on",
  "a testament to", "realm of", "harness the power", "revolutionize", "cutting-edge", "supercharge",
  "dive into", "let's dive", "whether you're a", "in the world of", "plays a crucial role", "robust",
];

function stripMarkdown(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ");
}

export function countWords(text: string) {
  const m = stripMarkdown(text).match(/[A-Za-z0-9'’]+/g);
  return m ? m.length : 0;
}

function syllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function sentences(text: string) {
  return stripMarkdown(text)
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => countWords(s) > 2);
}

/** Flesch reading ease (higher = easier). 60-70 is plain English. */
export function readingEase(text: string) {
  const words = stripMarkdown(text).match(/[A-Za-z']+/g) ?? [];
  const sents = Math.max(1, sentences(text).length);
  if (words.length === 0) return 0;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  return Math.round(206.835 - 1.015 * (words.length / sents) - 84.6 * (syl / words.length));
}

export function runQa(input: {
  body: string;
  format: string;
  keyword?: string | null;
  bannedWords?: string[];
  cta?: string | null;
}): QaReport {
  const { body, format } = input;
  const spec = FORMATS[format as Format];
  const checks: QaCheck[] = [];
  const lower = body.toLowerCase();
  const words = countWords(body);
  const ease = readingEase(body);

  // 1. Length
  if (spec) {
    const [min, max] = spec.words;
    const status = words < min * 0.8 || words > max * 1.3 ? "fail" : words < min || words > max ? "warn" : "pass";
    checks.push({ id: "length", label: "Length", status, detail: `${words} words (target ${min}-${max})` });
  }

  // 2. Readability
  checks.push({
    id: "readability",
    label: "Readability",
    status: ease >= 50 ? "pass" : ease >= 35 ? "warn" : "fail",
    detail: `Reading ease ${ease} (aim for 50+; 60-70 is plain English)`,
  });

  // 3. Long sentences
  const longOnes = sentences(body).filter((s) => countWords(s) > 30);
  checks.push({
    id: "long_sentences",
    label: "Long sentences",
    status: longOnes.length === 0 ? "pass" : longOnes.length <= 3 ? "warn" : "fail",
    detail: longOnes.length ? `${longOnes.length} sentence(s) over 30 words. First: "${longOnes[0].slice(0, 90)}..."` : "None over 30 words",
  });

  // 4. AI clichés
  const cliches = AI_CLICHES.filter((p) => lower.includes(p));
  checks.push({
    id: "ai_phrases",
    label: "AI-sounding phrases",
    status: cliches.length === 0 ? "pass" : cliches.length <= 2 ? "warn" : "fail",
    detail: cliches.length ? `Found: ${cliches.join(", ")}` : "None found",
  });

  // 5. Brand banned words
  const banned = (input.bannedWords ?? []).filter((w) => w && new RegExp(`\\b${escapeRe(w.toLowerCase())}\\b`).test(lower));
  checks.push({
    id: "banned_words",
    label: "Brand banned words",
    status: banned.length ? "fail" : "pass",
    detail: banned.length ? `Found: ${banned.join(", ")}` : "None used",
  });

  // 6. Unsourced statistics: a percentage or "X times" claim not followed by a link or [SOURCE]
  const statRe = /(\d+(?:\.\d+)?\s?%|\d+x\b|\d+ times)/gi;
  const unsourced: string[] = [];
  for (const m of body.matchAll(statRe)) {
    const after = body.slice(m.index!, m.index! + 160);
    if (!/\]\(|https?:\/\/|\[SOURCE|\(source/i.test(after)) unsourced.push(m[0]);
  }
  checks.push({
    id: "unsourced_stats",
    label: "Unsourced statistics",
    status: unsourced.length === 0 ? "pass" : "warn",
    detail: unsourced.length
      ? `${unsourced.length} number(s) with no source nearby: ${unsourced.slice(0, 5).join(", ")}. Verify or cite.`
      : "All statistics cited or none used",
  });

  // 7. Keyword placement (blogs/landing pages)
  if (input.keyword && (format === "blog" || format === "landing_page")) {
    const kw = input.keyword.toLowerCase();
    const firstHeading = (body.match(/^#\s+(.+)$/m)?.[1] ?? "").toLowerCase();
    const intro = stripMarkdown(body).toLowerCase().split(/\s+/).slice(0, 120).join(" ");
    const inTitle = firstHeading.includes(kw);
    const inIntro = intro.includes(kw);
    const occurrences = lower.split(kw).length - 1;
    const missing = [!inTitle && "title", !inIntro && "intro"].filter(Boolean);
    checks.push({
      id: "keyword",
      label: "Target keyword",
      status: missing.length === 0 ? "pass" : missing.length === 1 ? "warn" : "fail",
      detail: `"${input.keyword}" used ${occurrences}x${missing.length ? `; missing from ${missing.join(" and ")}` : "; in title and intro"}`,
    });
  }

  // 8. Structure
  const h2 = (body.match(/^##\s+/gm) ?? []).length;
  if (format === "blog") {
    checks.push({ id: "structure", label: "Headings", status: h2 >= 4 ? "pass" : h2 >= 2 ? "warn" : "fail", detail: `${h2} H2 sections (aim for 4-7)` });
  }
  if (format === "email_sequence") {
    const emails = (body.match(/^##\s*Email/gim) ?? []).length;
    const subjects = (body.match(/subject:/gi) ?? []).length;
    checks.push({
      id: "structure",
      label: "Sequence structure",
      status: emails >= 5 && subjects >= 5 ? "pass" : "fail",
      detail: `${emails} emails, ${subjects} subject lines (need 5 each)`,
    });
  }

  // 9. Call to action
  const hasCta = /\[button:|\[link\]|book a|get started|schedule|sign up|download|contact us|reply|start your|try it|learn more|\bcall\b/i.test(body)
    || (!!input.cta && lower.includes(input.cta.toLowerCase().slice(0, 20)));
  checks.push({ id: "cta", label: "Call to action", status: hasCta ? "pass" : "fail", detail: hasCta ? "CTA present" : "No clear next step for the reader" });

  // 10. Unfilled placeholders (good: they flag missing facts; still must be resolved before delivery)
  const placeholders = body.match(/\[(ADD [^\]]+|CLIENT QUOTE|SOURCE[^\]]*)\]/g) ?? [];
  checks.push({
    id: "placeholders",
    label: "Facts to fill in",
    status: placeholders.length ? "warn" : "pass",
    detail: placeholders.length ? `${placeholders.length} placeholder(s): ${[...new Set(placeholders)].slice(0, 4).join(", ")}` : "None",
  });

  const weights = { pass: 1, warn: 0.6, fail: 0 } as const;
  const score = Math.round((checks.reduce((s, c) => s + weights[c.status], 0) / checks.length) * 100);
  return { score, words, readingEase: ease, checks };
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
