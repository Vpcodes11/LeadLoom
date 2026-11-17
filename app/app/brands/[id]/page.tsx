import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createFunnel, deleteBrand, rebuildVoice, requestContent, updateBrand } from "@/lib/actions";
import { parseVoice } from "@/lib/brand";
import { FORMATS, STAGES } from "@/lib/formats";
import { ActionButton, ActionForm, Submit } from "@/components/forms";
import { BrandForm } from "@/components/brand-form";
import { ContentTable } from "@/components/content-table";
import { CopyButton } from "@/components/copy-button";
import { Badge, Button, Card, Empty, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";

// AI work (inline funnel planning, voice profiles, and background drafts started from here) needs long function time.
export const maxDuration = 300;

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await requireUser();
  const brand = await db.brand.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { funnels: { include: { _count: { select: { items: true } } }, orderBy: { createdAt: "desc" } }, items: { orderBy: [{ updatedAt: "desc" }] } },
  });
  if (!brand) notFound();
  const voice = parseVoice(brand.voiceProfile);
  const reviewUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/review/${brand.reviewToken}`;
  const loose = brand.items.filter((i) => !i.funnelId);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={brand.name}
        sub={[brand.industry, brand.website].filter(Boolean).join(" · ") || "Brand"}
        actions={<><CopyButton text={reviewUrl} label="Copy client review link" /><Link className="text-sm text-brand-600 self-center" href={`/review/${brand.reviewToken}`} target="_blank">Open portal ↗</Link></>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="mb-3 font-semibold">Funnels</h2>
            {brand.funnels.length === 0 ? <Empty>No funnels yet. Plan your first one on the right.</Empty> : (
              <div className="grid gap-3 sm:grid-cols-2">
                {brand.funnels.map((f) => (
                  <Link key={f.id} href={`/app/funnels/${f.id}`}>
                    <Card className="h-full hover:border-brand-500 transition">
                      <div className="font-medium">{f.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{f._count.items} pieces · goal: {f.goal}</div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-semibold">One-off requests</h2>
            <ContentTable items={loose} />
          </section>

          <section>
            <h2 className="mb-3 font-semibold">Voice profile</h2>
            <Card>
              {voice ? (
                <div className="space-y-3 text-sm">
                  <p className="text-slate-700">{voice.summary}</p>
                  <div className="flex flex-wrap gap-1.5">{voice.tone.map((t) => <Badge key={t}>{t}</Badge>)}</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><div className="text-xs font-semibold text-slate-500 uppercase">Do</div><ul className="mt-1 list-disc pl-5">{voice.dos.map((d) => <li key={d}>{d}</li>)}</ul></div>
                    <div><div className="text-xs font-semibold text-slate-500 uppercase">Don&apos;t</div><ul className="mt-1 list-disc pl-5">{voice.donts.map((d) => <li key={d}>{d}</li>)}</ul></div>
                  </div>
                  <div><span className="text-xs font-semibold text-slate-500 uppercase">Never says: </span>{voice.bannedWords.join(", ")}</div>
                  <div><span className="text-xs font-semibold text-slate-500 uppercase">Style: </span>{voice.sentenceStyle}</div>
                </div>
              ) : <p className="text-sm text-slate-600">No voice profile yet. Paste voice samples under &quot;Brand details&quot; and build one, so drafts sound like this brand.</p>}
              <div className="mt-4"><ActionButton action={rebuildVoice.bind(null, brand.id)} variant="secondary" size="sm" pending="Analysing samples...">{voice ? "Rebuild from samples" : "Build voice profile"}</ActionButton></div>
            </Card>
          </section>

          <details className="group">
            <summary className="cursor-pointer font-semibold">Brand details</summary>
            <Card className="mt-3"><BrandForm action={updateBrand.bind(null, brand.id)} brand={brand} submitLabel="Save brand" /></Card>
            <form action={deleteBrand.bind(null, brand.id)} className="mt-3">
              <Button variant="danger" size="sm">Delete brand and all its content</Button>
            </form>
          </details>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold">Plan a new funnel</h2>
            <p className="mb-4 text-xs text-slate-500">AI maps a connected set of pieces across awareness, consideration and decision.</p>
            <ActionForm action={createFunnel.bind(null, brand.id)} className="space-y-3">
              <Field label="Goal"><Input name="goal" required placeholder="e.g. book 20 demo calls a month" /></Field>
              <Field label="Name (optional)"><Input name="name" placeholder="Q1 demand funnel" /></Field>
              <Field label="Number of pieces"><Input name="pieces" type="number" min={3} max={15} defaultValue={7} /></Field>
              <Submit pending="Planning funnel...">Plan funnel</Submit>
            </ActionForm>
          </Card>

          <Card>
            <h2 className="font-semibold">Request a single piece</h2>
            <p className="mb-4 text-xs text-slate-500">For one-off needs outside a funnel.</p>
            <ActionForm action={requestContent.bind(null, brand.id)} className="space-y-3">
              <Field label="Working title"><Input name="title" required /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Format"><Select name="format">{Object.entries(FORMATS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}</Select></Field>
                <Field label="Stage"><Select name="stage">{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</Select></Field>
              </div>
              <Field label="Target keyword"><Input name="keyword" /></Field>
              <Field label="Angle / key message"><Textarea name="angle" rows={2} /></Field>
              <Field label="Call to action"><Input name="cta" placeholder="Book a free audit" /></Field>
              <Field label="Notes for the writer"><Textarea name="notes" rows={2} /></Field>
              <Field label="Due date"><Input name="dueDate" type="date" /></Field>
              <Submit pending="Creating...">Create request</Submit>
            </ActionForm>
          </Card>
        </div>
      </div>
    </div>
  );
}
