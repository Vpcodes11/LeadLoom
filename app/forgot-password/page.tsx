import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { GoogleButton } from "@/components/google-button";
import { contactLine } from "@/components/legal";
import { googleEnabled } from "@/lib/google";

// Rendered per request so the Google button follows the current env (no rebuild needed).
export const dynamic = "force-dynamic";

export const metadata = { title: "Forgot password · Leadloom" };

/**
 * Leadloom sends no email, so there are no reset links. Signing in with Google proves the email
 * address, links to the existing account, and allows a new password in Settings for 15 minutes.
 */
export default function ForgotPassword() {
  return (
    <AuthShell
      title="Forgot your password?"
      sub="Sign in with Google using the same email address. It opens your existing account, and you can then choose a new password in Settings."
      footer={<Link className="text-brand-600" href="/login">Back to log in</Link>}
    >
      <GoogleButton />
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
        {!googleEnabled() && <li>Google sign-in isn&apos;t available right now.</li>}
        <li>Continue with the Google account for your Leadloom email.</li>
        <li>Open <strong className="font-medium text-slate-800">Settings → Password</strong> within 15 minutes and set a new one.</li>
      </ol>
      <p className="mt-4 text-sm text-slate-600">Email that isn&apos;t a Google account? Contact {contactLine()} and we&apos;ll help.</p>
    </AuthShell>
  );
}
