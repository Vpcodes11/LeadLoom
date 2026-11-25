import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

const COOKIE = "ll_session";
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s || "dev-secret-change-me");
};

/** `sv` = the user's sessionVersion; bumping it (password reset/change) signs out every device. */
export async function createSession(user: { id: string; sessionVersion: number }) {
  const token = await new SignJWT({ sub: user.id, sv: user.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/**
 * A short-lived proof that this browser just signed in with Google. Google has verified the email,
 * so for 15 minutes the user may set a new password without the old one (this replaces emailed
 * reset links: Leadloom sends no email).
 */
const GOOGLE_FRESH = "ll_google_fresh";
export async function markGoogleSignIn(userId: string) {
  const token = await new SignJWT({ sub: userId, k: "google_fresh" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(secret());
  (await cookies()).set(GOOGLE_FRESH, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 15 * 60 });
}
export async function recentGoogleSignIn(userId: string) {
  const token = (await cookies()).get(GOOGLE_FRESH)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.sub === userId && payload.k === "google_fresh";
  } catch {
    return false;
  }
}
export async function clearGoogleSignIn() {
  (await cookies()).delete(GOOGLE_FRESH);
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

async function readSession(): Promise<{ id: string; sv: number } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? { id: payload.sub, sv: Number(payload.sv ?? 0) } : null;
  } catch {
    return null;
  }
}

/** The signed-in user and their workspace, or null (no redirect). Checks the session is still current. */
export async function getSignedInUser() {
  const s = await readSession();
  if (!s) return null;
  const user = await db.user.findUnique({
    where: { id: s.id },
    include: { memberships: { include: { workspace: true }, orderBy: { id: "asc" } } },
  });
  if (!user || user.sessionVersion !== s.sv || user.memberships.length === 0) return null;
  const m = user.memberships[0];
  return { user, workspace: m.workspace, role: m.role };
}

/** Returns the signed-in user and their workspace, or redirects to /login. */
export async function requireUser() {
  const ctx = await getSignedInUser();
  if (!ctx) redirect("/login");
  return ctx;
}

/** Like requireUser, but only workspace owners (billing, team, deleting the account). */
export async function requireOwner() {
  const ctx = await requireUser();
  if (ctx.role !== "owner") throw new Error("Only the workspace owner can do this.");
  return ctx;
}

export async function getOptionalUserId() {
  return (await readSession())?.id ?? null;
}
