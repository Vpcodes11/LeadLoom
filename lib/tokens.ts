import { createHash, randomBytes } from "node:crypto";

/** Random URL-safe token. Only its hash is stored, so a database leak can't be used to take over accounts. */
export function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
