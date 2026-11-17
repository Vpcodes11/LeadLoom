"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/actions";
import { Button, Textarea, cx } from "./ui";
import { Msg, Submit } from "./forms";

export function Editor({ body, html, action }: { body: string; html: string; action: (s: ActionState, f: FormData) => Promise<ActionState> }) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [state, run] = useActionState(async (s: ActionState, f: FormData) => {
    const r = await action(s, f);
    if (r?.ok) setMode("preview");
    return r;
  }, undefined);
  return (
    <div>
      <div className="mb-3 flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {(["preview", "edit"] as const).map((m) => (
          <Button key={m} type="button" size="sm" variant="ghost" onClick={() => setMode(m)} className={cx(mode === m && "bg-white shadow-sm text-slate-900")}>
            {m === "preview" ? "Preview" : "Edit Markdown"}
          </Button>
        ))}
      </div>
      {mode === "preview" ? (
        <div className="prose-ll" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <form action={run} className="space-y-3">
          <Textarea name="body" defaultValue={body} rows={30} className="font-mono text-[13px] leading-6" />
          <div className="flex items-center gap-3"><Submit pending="Saving...">Save new version</Submit><Msg state={state} /></div>
        </form>
      )}
    </div>
  );
}
