"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { clearGoogleSignIn, createSession, destroySession, recentGoogleSignIn, requireOwner, requireUser } from "./auth";
import { rateLimit } from "./ratelimit";
import { hashToken, newToken } from "./tokens";
import { planOf } from "./plans";
import { billingEnabled, cancelSubscription } from "./billing";

export type FormState = { error?: string; ok?: string; link?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";
const HOUR = 3_600_000;

// ---------- Password ----------

export async function changePassword(_: FormState, f: FormData): Promise<FormState> {
  const { user } = await requireUser();
  if (!(await rateLimit(`password-change:${user.id}`, 5, 15 * 60_000))) return { error: "Too many attempts. Wait 15 minutes and try again." };
  const next = str(f, "password");
  // Google-only accounts have no password yet; they're already signed in, so they can set one.
  // A sign-in with Google in the last 15 minutes also proves the email, so a forgotten password can be replaced.
  const proven = !user.passwordHash || (await recentGoogleSignIn(user.id));
  if (!proven && !(await bcrypt.compare(str(f, "current"), user.passwordHash!))) return { error: "Your current password is wrong." };
  if (next.length < 8) return { error: "Use at least 8 characters." };
  const updated = await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10), sessionVersion: { increment: 1 } } });
  await createSession(updated); // keep this device signed in, sign out every other one
  await clearGoogleSignIn();
  return { ok: user.passwordHash ? "Password changed. Other devices have been signed out." : "Password set. You can now also log in with your email." };
}

// ---------- Team ----------

export async function createInvite(_: FormState, f: FormData): Promise<FormState> {
  try {
    const { workspace, user } = await requireOwner();
    const email = str(f, "email").toLowerCase();
    if (!email.includes("@")) return { error: "Enter a valid email address." };
    const [members, pending] = await Promise.all([
      db.membership.count({ where: { workspaceId: workspace.id } }),
      db.invite.count({ where: { workspaceId: workspace.id, acceptedAt: null, expiresAt: { gt: new Date() } } }),
    ]);
    const seats = planOf(workspace.plan).seats;
    if (members + pending >= seats) return { error: `Your ${planOf(workspace.plan).name} plan includes ${seats} seat${seats === 1 ? "" : "s"}. Upgrade on the Billing page to add teammates.` };
    if (await db.user.findUnique({ where: { email } })) return { error: "That email already has a Leadloom account." };
    const { token, hash } = newToken();
    await db.invite.create({ data: { workspaceId: workspace.id, email, role: "editor", tokenHash: hash, expiresAt: new Date(Date.now() + 7 * 24 * HOUR) } });
    const link = `${appUrl()}/invite/${token}`;
    revalidatePath("/app/settings");
    return { ok: `Invite created. Send ${email} this link (it expires in 7 days):`, link };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create the invite." };
  }
}

export async function revokeInvite(inviteId: string) {
  const { workspace } = await requireOwner();
  await db.invite.deleteMany({ where: { id: inviteId, workspaceId: workspace.id, acceptedAt: null } });
  revalidatePath("/app/settings");
}

export async function removeMember(membershipId: string) {
  const { workspace, user } = await requireOwner();
  const m = await db.membership.findFirst({ where: { id: membershipId, workspaceId: workspace.id } });
  if (!m || m.userId === user.id) return;
  // Members belong to one workspace, so removing them deletes their login too.
  await db.user.delete({ where: { id: m.userId } });
  revalidatePath("/app/settings");
}

export async function acceptInvite(token: string, _: FormState, f: FormData): Promise<FormState> {
  const name = str(f, "name");
  const password = str(f, "password");
  if (!name || password.length < 8) return { error: "Enter your name and a password of 8+ characters." };
  const invite = await db.invite.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) return { error: "This invite is invalid or has expired. Ask for a new one." };
  if (await db.user.findUnique({ where: { email: invite.email } })) return { error: "That email already has a Leadloom account. Log in instead." };
  // Claim the invite atomically: an invite link works exactly once, even if submitted twice at the same moment.
  const claimed = await db.invite.updateMany({ where: { id: invite.id, acceptedAt: null }, data: { acceptedAt: new Date() } });
  if (claimed.count !== 1) return { error: "This invite has already been used." };
  const user = await db.user.create({
    data: {
      email: invite.email, name, passwordHash: await bcrypt.hash(password, 10),
      memberships: { create: { workspaceId: invite.workspaceId, role: invite.role } },
    },
  });
  await createSession(user);
  redirect("/app");
}

// ---------- Delete account ----------

export async function deleteAccount(_: FormState, f: FormData): Promise<FormState> {
  let workspaceName: string;
  try {
    const { workspace } = await requireOwner();
    workspaceName = workspace.name;
    if (str(f, "confirm") !== workspace.name) return { error: `Type "${workspace.name}" exactly to confirm.` };
    if (billingEnabled() && workspace.billingSubscriptionId) {
      try { await cancelSubscription(workspace.billingSubscriptionId); } catch (e) { console.error("subscription cancel failed", e); }
    }
    const memberIds = (await db.membership.findMany({ where: { workspaceId: workspace.id }, select: { userId: true } })).map((m) => m.userId);
    await db.$transaction([
      db.workspace.delete({ where: { id: workspace.id } }), // cascades brands, content, jobs, invites, memberships
      db.user.deleteMany({ where: { id: { in: memberIds }, memberships: { none: {} } } }),
    ]);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not delete the account." };
  }
  await destroySession();
  console.log(`workspace deleted: ${workspaceName}`);
  redirect("/?deleted=1");
}

