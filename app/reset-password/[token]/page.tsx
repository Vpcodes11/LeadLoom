import Link from "next/link";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import { resetPassword } from "@/lib/account-actions";
import { AuthShell } from "@/components/auth-shell";
import { NewPasswordForm } from "@/components/account-forms";

export const metadata = { title: "Choose a new password · Leadloom", robots: { index: false } };

export default async function ResetPassword({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rec = await db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  const valid = rec && !rec.usedAt && rec.expiresAt > new Date();
  if (!valid) {
    return (
      <AuthShell title="Link expired" sub="This reset link is invalid, already used, or older than 1 hour.">
        <Link href="/forgot-password" className="text-sm text-brand-600">Request a new link</Link>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Choose a new password" sub="You'll be signed in, and signed out on every other device.">
      <NewPasswordForm action={resetPassword.bind(null, token)} />
    </AuthShell>
  );
}
