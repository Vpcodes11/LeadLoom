"use client";

import { useActionState } from "react";
import type { Brand } from "@prisma/client";
import type { ActionState } from "@/lib/actions";
import { Field, Input, Textarea } from "./ui";
import { Msg, Submit } from "./forms";

export function BrandForm({ action, brand, submitLabel }: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  brand?: Brand;
  submitLabel: string;
}) {
  const [state, run] = useActionState(action, undefined);
  const v = (k: keyof Brand) => (brand?.[k] as string | null | undefined) ?? "";
  return (
    <form action={run} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Brand name *"><Input name="name" defaultValue={v("name")} required /></Field>
        <Field label="Website"><Input name="website" defaultValue={v("website")} placeholder="https://" /></Field>
        <Field label="Industry"><Input name="industry" defaultValue={v("industry")} placeholder="e.g. B2B SaaS, dental clinic" /></Field>
      </div>
      <Field label="Ideal customer *" hint="Who buys, what they struggle with, what they want. Be specific.">
        <Textarea name="audience" rows={3} defaultValue={v("audience")} required placeholder="Owners of 5-20 person marketing agencies who lose margin on content because freelancers miss deadlines..." />
      </Field>
      <Field label="Offer *" hint="What you sell, the price point, and the main outcome.">
        <Textarea name="offer" rows={2} defaultValue={v("offer")} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="What makes you different"><Textarea name="differentiators" rows={3} defaultValue={v("differentiators")} /></Field>
        <Field label="Competitors"><Textarea name="competitors" rows={3} defaultValue={v("competitors")} /></Field>
      </div>
      <Field label="Proof points" hint="Real results, numbers, testimonials, client names you may mention. The AI will ONLY use facts from here.">
        <Textarea name="proofPoints" rows={4} defaultValue={v("proofPoints")} placeholder={"- Helped Acme Dental grow bookings 38% in 4 months\n- 4.9★ from 120 Google reviews\n- \"They finally made content easy\" — Jane, COO at Brightside"} />
      </Field>
      <Field label="Voice samples" hint="Paste 2-5 pieces the brand has written (posts, emails, about page). We'll learn the voice from these.">
        <Textarea name="voiceSamples" rows={8} defaultValue={v("voiceSamples")} />
      </Field>
      <Msg state={state} />
      <Submit pending="Saving and learning the voice...">{submitLabel}</Submit>
    </form>
  );
}
