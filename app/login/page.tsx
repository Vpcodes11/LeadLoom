import Link from "next/link";
import { redirect } from "next/navigation";
import { getSignedInUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { GoogleButton, GOOGLE_ERRORS } from "@/components/google-button";

// Rendered per request so the Google button follows the current env (no rebuild needed).
export const dynamic = "force-dynamic";

export const metadata = { title: "Log in · Leadloom" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  // Already signed in (e.g. from a landing-page button): go straight to the workspace.
  if (await getSignedInUser()) redirect("/app");
  const { error } = await searchParams;
  return (
    <AuthShell title="Log in" footer={<>New here? <Link className="text-brand-600" href="/signup">Create an account</Link></>}>
      {error && GOOGLE_ERRORS[error] && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{GOOGLE_ERRORS[error]}</p>}
      <GoogleButton />
      <LoginForm />
      <Link href="/forgot-password" className="mt-4 block text-sm text-brand-600">Forgot your password?</Link>
    </AuthShell>
  );
}
