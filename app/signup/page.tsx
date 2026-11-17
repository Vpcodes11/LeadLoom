import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui";
import { SignupForm } from "@/components/auth-forms";

export default function Signup() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card>
          <h1 className="mb-1 text-xl font-semibold">Create your account</h1>
          <p className="mb-5 text-sm text-slate-600">Free trial: 1 brand, 5 pieces. No card needed.</p>
          <SignupForm />
        </Card>
        <p className="mt-4 text-center text-sm text-slate-600">Have an account? <Link className="text-brand-600" href="/login">Log in</Link></p>
      </div>
    </div>
  );
}
