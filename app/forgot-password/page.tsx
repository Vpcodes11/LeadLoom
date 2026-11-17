import Link from "next/link";
import { requestPasswordReset } from "@/lib/account-actions";
import { AuthShell } from "@/components/auth-shell";
import { ForgotForm } from "@/components/account-forms";

export const metadata = { title: "Reset password · Leadloom" };

export default function ForgotPassword() {
  return (
    <AuthShell title="Forgot your password?" sub="Enter your email and we'll send you a link to choose a new one." footer={<Link className="text-brand-600" href="/login">Back to log in</Link>}>
      <ForgotForm action={requestPasswordReset} />
    </AuthShell>
  );
}
