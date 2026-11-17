import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui";
import { LoginForm } from "@/components/auth-forms";

export default function Login() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card>
          <h1 className="mb-5 text-xl font-semibold">Log in</h1>
          <LoginForm />
        </Card>
        <p className="mt-4 text-center text-sm text-slate-600">New here? <Link className="text-brand-600" href="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}
