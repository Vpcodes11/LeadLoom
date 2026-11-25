# Security checklist (run before calling any website done)

Two passes. Run both on every site before launch and after any change to auth, payments, uploads, webhooks or hosting. For each item: say whether it applies, show the file and line, fix it, and add a test where one can prove the fix.

## Pass A: the 14 basics

1. Secrets: none in the repo, the client bundle or logs; `.env*` git-ignored; keys scoped (send-only, test vs live).
2. Auth on every server route and action; no "hidden" admin URLs.
3. Authorisation / IDOR: every query scoped to the signed-in user's workspace (`where: { id, workspaceId }`), including reads, deletes and restores.
4. Input validation and length limits on every field, server side.
5. XSS: no raw HTML from users or AI; markdown rendered safely; links limited to http(s)/mailto.
6. CSRF: framework protection on (Next.js server actions), `SameSite` cookies.
7. Rate limits on login, signup, password change, invites, AI calls and anything that costs money.
8. Sessions: httpOnly, Secure, SameSite cookies; sign out other devices on password change.
9. Payments: webhook signatures verified; upgrades only after verified payment; idempotent handlers.
10. Security headers: CSP, HSTS, X-Frame-Options / frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy.
11. Errors: no stack traces or internals shown to users.
12. Dependencies: `npm audit`, no abandoned packages, lockfile committed.
13. File uploads (if any): type and size checks, stored outside the web root, never executed.
14. Data deletion: account deletion actually removes data and cancels billing.

## Pass B: the 20 "pen-test level" attacks

| # | Attack | What to check | How it's closed |
|---|---|---|---|
| 1 | HTTP/2 Rapid Reset | Hosting layer | Use a managed edge (Vercel, Cloudflare); not app code |
| 2 | 52-char username (Okta bcrypt bug) | bcrypt over concatenated strings, or passwords > 72 bytes | Hash the password alone; cap passwords at 72 bytes |
| 3 | SAML bypass | Only if SAML SSO exists | Use a maintained library, verify the whole signed assertion |
| 4 | nOAuth email spoof | OAuth sign-in that trusts a mutable or unverified email | Match on provider user ID first; link by email only if `email_verified` is true and the issuer is checked |
| 5 | GraphQL aliases | Batching many attempts in one request | No GraphQL, or rate-limit per operation, not per request |
| 6 | 2FA / one-time code replay | Codes and links usable twice | Single-use tokens claimed atomically; short expiry |
| 7 | ReDoS regex | Regexes built from user input or run on huge text | Escape user input; avoid nested or adjacent quantifiers; cap input size; test with hostile strings |
| 8 | JWT alg confusion | `none` or a switched algorithm accepted | Pin `algorithms: ["HS256"]` (or your one alg) on verify |
| 9 | Request smuggling | Proxy/server disagreement | Managed edge; don't run your own proxy chain |
| 10 | Cache poisoning | Personalised pages cached publicly; URLs built from the Host header | `Cache-Control: private, no-store` on dynamic pages; build absolute URLs from an env var |
| 11 | Spoofed IP header | Rate limits keyed on client-controlled `X-Forwarded-For` | Read only the header your host sets (Vercel `x-real-ip`, Cloudflare `cf-connecting-ip`) |
| 12 | Views bypass RLS | Supabase/Postgres views or functions skipping row security | `security_invoker` views; or scope every query in code |
| 13 | `Math.random` tokens | Predictable reset/invite/session tokens | `crypto.randomBytes(32)`; store only a hash |
| 14 | Timing attack | `===` on secrets; faster replies for unknown accounts | `timingSafeEqual`; compare against a dummy hash when the user doesn't exist |
| 15 | Padding oracle | Home-made CBC encryption | Don't roll crypto; use AES-GCM via a vetted library, or no encryption at all |
| 16 | Prototype pollution | Deep-merging user JSON into objects | No deep merge of untrusted input; validate with a schema |
| 17 | Template injection | User text inside server templates (emails, prompts with code eval) | Escape everything; never evaluate templates built from user input |
| 18 | XXE file read | XML parsing (SVG, DOCX, SAML, RSS) | Disable external entities, or don't parse XML |
| 19 | WebSocket hijack | WS upgrades without an Origin check or auth | Check `Origin` and authenticate the socket |
| 20 | Unicode lookalikes ("Spotify") | Usernames/emails that normalise differently | One canonical form everywhere: `normalize("NFKC")` + lowercase, applied once at input |

## LeadLoom result (25 November 2026)

| # | Vulnerable? | Where | Fix |
|---|---|---|---|
| 1 | No (not app code) | Vercel edge | — |
| 2 | Not exploitable, hardened | `lib/security.ts` `passwordError` | Passwords capped at 72 bytes |
| 3 | No (no SAML) | — | — |
| 4 | No | `lib/google.ts` (`email_verified`, issuer, audience checked; Google ID matched first) | — |
| 5 | No (no GraphQL); login limited per email and per IP | `lib/actions.ts` `login` | — |
| 6 | No | Invites claimed atomically, single use (`lib/account-actions.ts` `acceptInvite`) | — |
| 7 | Not exploitable in practice, hardened | `lib/qa.ts` `keywordRegex`; `lib/actions.ts` `saveBody` | Simpler regex shape; drafts capped at 200k characters; hostile-input test |
| 8 | Low (jose already blocks `none`), hardened | `lib/auth.ts` | `algorithms: ["HS256"]` pinned |
| 9 | No (not app code) | Vercel edge | — |
| 10 | No | Dynamic pages send `private, no-store`; URLs from `APP_URL` | — |
| 11 | Not on Vercel (it overwrites the header); **would be on Cloudflare** | `lib/ratelimit.ts` `clientIp` trusted the first `X-Forwarded-For` value | Reads only `TRUSTED_IP_HEADER` (default `x-real-ip`; set `cf-connecting-ip` on Cloudflare) |
| 12 | No (no Supabase/RLS); queries scoped by workspace | `lib/actions.ts` `ownItem` etc. | — |
| 13 | No | `lib/tokens.ts` uses `randomBytes(32)`, stores SHA-256 | — |
| 14 | **Yes** (two spots) | Cron secret compared with `!==`; login returned faster for unknown emails | `safeEqual` for the cron secret; dummy bcrypt compare on login |
| 15 | No (no encryption) | — | — |
| 16 | No (no deep merges of user input) | — | — |
| 17 | No (React escapes; markdown sanitised; no server templates) | `lib/markdown.ts` | — |
| 18 | No (no XML parsing) | — | — |
| 19 | No (no WebSockets) | — | — |
| 20 | **Yes** (lookalike emails could make twin accounts) | Signup, login, invites, Google | `normEmail` (NFKC + lowercase) everywhere |

Tests: `lib/security.test.ts`.
