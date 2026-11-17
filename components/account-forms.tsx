"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/account-actions";
import { Field, Input } from "./ui";
import { Submit } from "./forms";
import { CopyButton } from "./copy-button";

type Action = (s: FormState, f: FormData) => Promise<FormState>;

function Msg({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error) return <p className="text-sm text-red-600" role="alert">{state.error}</p>;
  return (
    <div className="space-y-2">
      {state.ok && <p className="text-sm text-emerald-700">{state.ok}</p>}
      {state.link && (
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-slate-100 px-2 py-1.5 text-xs">{state.link}</code>
          <CopyButton text={state.link} label="Copy link" />
        </div>
      )}
    </div>
  );
}

export function ForgotForm({ action }: { action: Action }) {
  const [state, run] = useActionState(action, undefined);
  return (
    <form action={run} className="space-y-4">
      <Field label="Email"><Input name="email" type="email" required autoComplete="email" /></Field>
      <Msg state={state} />
      <Submit pending="Sending...">Send reset link</Submit>
    </form>
  );
}

export function NewPasswordForm({ action }: { action: Action }) {
  const [state, run] = useActionState(action, undefined);
  return (
    <form action={run} className="space-y-4">
      <Field label="New password" hint="At least 8 characters"><Input name="password" type="password" required minLength={8} autoComplete="new-password" /></Field>
      <Field label="Confirm password"><Input name="confirm" type="password" required minLength={8} autoComplete="new-password" /></Field>
      <Msg state={state} />
      <Submit pending="Saving...">Set new password</Submit>
    </form>
  );
}

export function AcceptInviteForm({ action, email }: { action: Action; email: string }) {
  const [state, run] = useActionState(action, undefined);
  return (
    <form action={run} className="space-y-4">
      <Field label="Email"><Input value={email} disabled /></Field>
      <Field label="Your name"><Input name="name" required autoComplete="name" /></Field>
      <Field label="Choose a password" hint="At least 8 characters"><Input name="password" type="password" required minLength={8} autoComplete="new-password" /></Field>
      <Msg state={state} />
      <Submit pending="Joining...">Join the team</Submit>
    </form>
  );
}

export function ChangePasswordForm({ action }: { action: Action }) {
  const [state, run] = useActionState(action, undefined);
  return (
    <form action={run} className="space-y-3">
      <Field label="Current password"><Input name="current" type="password" required autoComplete="current-password" /></Field>
      <Field label="New password" hint="At least 8 characters"><Input name="password" type="password" required minLength={8} autoComplete="new-password" /></Field>
      <Msg state={state} />
      <Submit variant="secondary" pending="Saving...">Change password</Submit>
    </form>
  );
}

export function InviteForm({ action }: { action: Action }) {
  const [state, run] = useActionState(action, undefined);
  return (
    <form action={run} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input name="email" type="email" required placeholder="teammate@agency.com" className="min-w-0 flex-1" />
        <Submit pending="Inviting...">Invite</Submit>
      </div>
      <Msg state={state} />
    </form>
  );
}

export function DeleteAccountForm({ action, name }: { action: Action; name: string }) {
  const [state, run] = useActionState(action, undefined);
  return (
    <form action={run} className="space-y-3" onSubmit={(e) => { if (!window.confirm("Delete the workspace, all brands and content, and cancel billing? This can't be undone.")) e.preventDefault(); }}>
      <Field label={`Type "${name}" to confirm`}><Input name="confirm" required autoComplete="off" /></Field>
      <Msg state={state} />
      <Submit variant="danger" pending="Deleting...">Delete workspace and account</Submit>
    </form>
  );
}
