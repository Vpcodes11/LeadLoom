import Link from "next/link";
import { redirect } from "next/navigation";
import { getSignedInUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/auth-forms";
import { GoogleButton } from "@/components/google-button";

// Rendered per request so the Google button follows the current env (no rebuild needed).
export const dynamic = "force-dynamic";

export const metadata = { title: "Start free · Leadloom" };

export default async function Signup() {
  // Already signed in (e.g. from a landing-page button): go straight to the workspace.
  if (await getSignedInUser()) redirect("/app");
  return (
    <AuthShell title="Create your account" sub="Free trial: 5 pieces, 2 seats. No card needed." footer={<>Have an account? <Link className="text-brand-600" href="/login">Log in</Link></>}>
      <GoogleButton label="Sign up with Google" />
      <SignupForm />
    </AuthShell>
  );
}
