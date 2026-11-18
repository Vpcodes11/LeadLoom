import Link from "next/link";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import { acceptInvite } from "@/lib/account-actions";
import { AuthShell } from "@/components/auth-shell";
import { AcceptInviteForm } from "@/components/account-forms";
import { GoogleButton } from "@/components/google-button";

export const metadata = { title: "Join your team · Leadloom", robots: { index: false } };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await db.invite.findUnique({ where: { tokenHash: hashToken(token) }, include: { workspace: true } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return (
      <AuthShell title="Invite not valid" sub="This invite was already used or has expired. Ask your team owner for a new one.">
        <Link href="/login" className="text-sm text-brand-600">Go to log in</Link>
      </AuthShell>
    );
  }
  return (
    <AuthShell title={`Join ${invite.workspace.name}`} sub="Create your login to start working with the team.">
      <GoogleButton invite={token} label={`Join with Google (${invite.email})`} />
      <AcceptInviteForm action={acceptInvite.bind(null, token)} email={invite.email} />
    </AuthShell>
  );
}
