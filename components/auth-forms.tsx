"use client";

import { useActionState } from "react";
import { login, signup } from "@/lib/actions";
import { Field, Input } from "./ui";
import { Msg, Submit } from "./forms";

export function SignupForm() {
  const [state, run] = useActionState(signup, undefined);
  return (
    <form action={run} className="space-y-4">
      <Field label="Your name"><Input name="name" required autoComplete="name" /></Field>
      <Field label="Company or agency"><Input name="company" autoComplete="organization" /></Field>
      <Field label="Email"><Input name="email" type="email" required autoComplete="email" /></Field>
      <Field label="Password" hint="At least 8 characters"><Input name="password" type="password" required minLength={8} autoComplete="new-password" /></Field>
      <Msg state={state} />
      <Submit pending="Creating account...">Create account</Submit>
      <p className="text-xs text-slate-500">By creating an account you agree to the <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.</p>
    </form>
  );
}

export function LoginForm() {
  const [state, run] = useActionState(login, undefined);
  return (
    <form action={run} className="space-y-4">
      <Field label="Email"><Input name="email" type="email" required autoComplete="email" /></Field>
      <Field label="Password"><Input name="password" type="password" required autoComplete="current-password" /></Field>
      <Msg state={state} />
      <Submit pending="Logging in...">Log in</Submit>
    </form>
  );
}
