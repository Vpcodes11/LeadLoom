import { NextResponse } from "next/server";
import { googleEnabled, startAuth, STATE_COOKIE } from "@/lib/google";

/** Starts "Continue with Google". `?invite=<token>` joins a team after sign-in. */
export async function GET(req: Request) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  if (!googleEnabled()) return NextResponse.redirect(`${base}/login?error=google_off`);
  const invite = new URL(req.url).searchParams.get("invite") ?? "";
  const { url, state, verifier } = startAuth();
  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, JSON.stringify({ state, verifier, invite }), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/api/auth/google", maxAge: 600,
  });
  return res;
}
