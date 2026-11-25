"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions";
import { Input, Textarea } from "./ui";
import { Msg, Submit } from "./forms";
import { SparkleBurst } from "./sparkle-burst";

export function ReviewForm({ action }: { action: (s: ActionState, f: FormData) => Promise<ActionState> }) {
  const [state, run] = useActionState(action, undefined);
  if (state?.ok) {
    return (
      <p className="relative rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
        {state.ok.startsWith("Approved") && <SparkleBurst />}
        {state.ok}
      </p>
    );
  }
  return (
    <form action={run} className="space-y-2">
      <Input name="name" placeholder="Your name" />
      <Textarea name="body" rows={3} placeholder="Feedback (required if requesting changes)" />
      <div className="flex flex-wrap gap-2">
        <Submit name="decision" value="approve">Approve</Submit>
        <Submit name="decision" value="changes" variant="secondary">Request changes</Submit>
      </div>
      <Msg state={state} />
    </form>
  );
}
