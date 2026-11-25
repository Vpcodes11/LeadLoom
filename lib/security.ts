import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Small security helpers shared by auth, rate limiting and cron.
 * docs/SECURITY-CHECKLIST.md lists the attacks each one closes.
 */

/** One canonical form for every email we store or look up: Unicode NFKC, trimmed, lowercase.
 *  Applied everywhere, so lookalike forms (e.g. fullwidth letters) can't create a twin account. */
export function normEmail(raw: string) {
  return raw.normalize("NFKC").trim().toLowerCase();
}

/** bcrypt only reads the first 72 bytes; longer passwords would be silently truncated. */
export function passwordError(pw: string) {
  if (pw.length < 8) return "Use at least 8 characters.";
  if (Buffer.byteLength(pw, "utf8") > 72) return "Use at most 72 characters.";
  return null;
}

/** Constant-time string comparison (hashing first makes the lengths equal). */
export function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
