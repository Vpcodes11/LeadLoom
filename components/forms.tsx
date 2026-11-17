"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions";
import { Button, type BtnVariant } from "./ui";

export function Submit({ children, pending, variant = "primary", size = "md", name, value }: { children: ReactNode; pending?: string; variant?: BtnVariant; size?: "sm" | "md"; name?: string; value?: string }) {
  const s = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} disabled={s.pending} name={name} value={value}>
      {s.pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {s.pending ? pending ?? "Working..." : children}
    </Button>
  );
}

export function Msg({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error) return <p className="text-sm text-red-600" role="alert">{state.error}</p>;
  if (state.ok) return <p className="text-sm text-emerald-700">{state.ok}</p>;
  return null;
}

/** Generic form bound to a server action with (prevState, formData) signature. */
export function ActionForm({ action, children, className }: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  children: ReactNode | ((state: ActionState) => ReactNode);
  className?: string;
}) {
  const [state, run] = useActionState(action, undefined);
  return (
    <form action={run} className={className}>
      {typeof children === "function" ? children(state) : <>{children}<Msg state={state} /></>}
    </form>
  );
}

/** Button that runs an action with no form fields, e.g. "Generate draft". */
export function ActionButton({ action, children, pending, variant, size, confirm }: {
  action: (s: ActionState) => Promise<ActionState>;
  children: ReactNode; pending?: string; variant?: BtnVariant; size?: "sm" | "md"; confirm?: string;
}) {
  const [state, run] = useActionState(action, undefined);
  return (
    <form action={run} className="inline-flex flex-col gap-1" onSubmit={(e) => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>
      <Submit pending={pending} variant={variant} size={size}>{children}</Submit>
      <Msg state={state} />
    </form>
  );
}
