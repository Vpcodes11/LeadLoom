"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
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

/** Errors stay until the next submit; success messages fade after a few seconds, so a
 * "Writing 5 pieces..." note doesn't linger once the work is done. */
export function Msg({ state }: { state: ActionState }) {
  const [hiddenOk, setHiddenOk] = useState<ActionState>(undefined);
  useEffect(() => {
    if (!state?.ok) return;
    const t = setTimeout(() => setHiddenOk(state), 6000);
    return () => clearTimeout(t);
  }, [state]);
  if (!state) return null;
  if (state.error) return <p className="text-sm text-red-600" role="alert">{state.error}</p>;
  if (state.ok && hiddenOk !== state) return <p className="text-sm text-emerald-700" role="status">{state.ok}</p>;
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
