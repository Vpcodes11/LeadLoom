import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createSession, markGoogleSignIn } from "@/lib/auth";
import { finishAuth, STATE_COOKIE } from "@/lib/google";
import { hashToken } from "@/lib/tokens";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function GET(req: Request) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const fail = (code: string) => {
    const res = NextResponse.redirect(`${base}/login?error=${code}`);
    res.cookies.delete({ name: STATE_COOKIE, path: "/api/auth/google" });
    return res;
  };
  const params = new URL(req.url).searchParams;
  if (params.get("error")) return fail("google_cancelled");
  const jar = await cookies();
  let saved: { state: string; verifier: string; invite: string };
  try { saved = JSON.parse(jar.get(STATE_COOKIE)?.value ?? ""); } catch { return fail("google_state"); }
  const code = params.get("code");
  if (!code || !saved.state || params.get("state") !== saved.state) return fail("google_state");

  let profile;
  try { profile = await finishAuth(code, saved.verifier); } catch (e) {
    console.error("google sign-in failed:", e);
    return fail("google_failed");
  }

  // 1) Returning Google user, or 2) existing email account: link it (Google has verified the email).
  let user = await db.user.findUnique({ where: { googleId: profile.sub } })
    ?? await db.user.findUnique({ where: { email: profile.email } });
  if (user && !user.googleId) user = await db.user.update({ where: { id: user.id }, data: { googleId: profile.sub } });

  if (!user) {
    if (saved.invite) {
      // 3) Joining a team from an invite: the Google email must match the invited email.
      const invite = await db.invite.findUnique({ where: { tokenHash: hashToken(saved.invite) } });
      if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) return fail("invite_invalid");
      if (invite.email !== profile.email) return fail("invite_email");
      user = await db.user.create({
        data: { email: profile.email, name: profile.name, googleId: profile.sub, memberships: { create: { workspaceId: invite.workspaceId, role: invite.role } } },
      });
      await db.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
    } else {
      // 4) New account with its own workspace.
      if (!(await rateLimit(`signup:${await clientIp()}`, 3, 86_400_000))) return fail("signup_limit");
      user = await db.user.create({
        data: {
          email: profile.email, name: profile.name, googleId: profile.sub,
          memberships: { create: { role: "owner", workspace: { create: { name: `${profile.name}'s workspace` } } } },
        },
      });
    }
  }

  await createSession(user);
  await markGoogleSignIn(user.id); // lets a user who forgot their password set a new one (no email resets)
  const res = NextResponse.redirect(`${base}/app`);
  res.cookies.delete({ name: STATE_COOKIE, path: "/api/auth/google" });
  return res;
}
