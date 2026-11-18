import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { decodeJwt } from "jose";

/** Google OAuth 2.0 / OpenID Connect (authorization code + PKCE). Endpoints can be overridden only for local tests. */
const AUTH_URL = process.env.GOOGLE_AUTH_URL_OVERRIDE || "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = process.env.GOOGLE_TOKEN_URL_OVERRIDE || "https://oauth2.googleapis.com/token";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com", ...(process.env.GOOGLE_ISSUER_OVERRIDE ? [process.env.GOOGLE_ISSUER_OVERRIDE] : [])];

export const googleEnabled = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const redirectUri = () => `${process.env.APP_URL ?? "http://localhost:3000"}/api/auth/google/callback`;
export const STATE_COOKIE = "ll_google";

export function startAuth() {
  const state = randomBytes(24).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return { url: url.toString(), state, verifier };
}

export type GoogleProfile = { sub: string; email: string; name: string };

/** Exchanges the code for tokens and returns the verified profile. Throws on anything unexpected. */
export async function finishAuth(code: string, verifier: string): Promise<GoogleProfile> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code, code_verifier: verifier, grant_type: "authorization_code", redirect_uri: redirectUri(),
      client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed (${res.status})`);
  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("no id_token");
  // The ID token came straight from Google's token endpoint over TLS (back channel), so per OpenID Connect
  // Core 3.1.3.7 the TLS server check stands in for signature validation. We still check every claim.
  const c = decodeJwt(id_token);
  if (!ISSUERS.includes(String(c.iss))) throw new Error("bad issuer");
  if (c.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error("bad audience");
  if (!c.exp || c.exp * 1000 < Date.now()) throw new Error("expired token");
  if (c.email_verified !== true || typeof c.email !== "string" || typeof c.sub !== "string") throw new Error("email not verified");
  return { sub: c.sub, email: c.email.toLowerCase(), name: typeof c.name === "string" && c.name ? c.name : c.email.split("@")[0] };
}
