import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addComment, aiRevise, deleteItem, generateDraft, restoreRevision, saveBody, setStatus } from "@/lib/actions";
import { renderMarkdown } from "@/lib/markdown";
import { formatLabel, statusLabel } from "@/lib/formats";
import type { QaReport } from "@/lib/qa";
import { ActionButton, ActionForm, Submit } from "@/components/forms";
import { Editor } from "@/components/editor";
import { CopyButton } from "@/components/copy-button";
import { SparkleBurst } from "@/components/sparkle-burst";
import { Badge, Button, Card, Empty, PageHeader, Textarea, btnClass, cx } from "@/components/ui";
import { JobWatcher } from "@/components/job-watcher";

// AI work (inline funnel planning, voice profiles, and background drafts started from here) needs long function time.
export const maxDuration = 300;

const NEXT: Record<string, { status: string; label: string; variant?: "primary" | "secondary" }[]> = {
  draft: [{ status: "in_review", label: "Send to client for review" }, { status: "approved", label: "Approve internally", variant: "secondary" }],
  changes_requested: [{ status: "in_review", label: "Re-send for review" }],
  in_review: [{ status: "approved", label: "Mark approved", variant: "secondary" }, { status: "draft", label: "Pull back to draft", variant: "secondary" }],
  approved: [{ status: "delivered", label: "Mark delivered" }],
  delivered: [{ status: "approved", label: "Reopen", variant: "secondary" }],
};

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await requireUser();
  const item = await db.contentItem.findFirst({
    where: { id, brand: { workspaceId: workspace.id } },
    include: { brand: true, funnel: true, comments: { orderBy: { createdAt: "asc" } }, revisions: { orderBy: { version: "desc" }, take: 15 }, jobs: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!item) notFound();
  const job = item.jobs[0];
  const working = !!job && (job.status === "queued" || job.status === "running");
  const failed = job?.status === "failed" ? job : null;
  const qa: QaReport | null = item.qaReport ? JSON.parse(item.qaReport) : null;
  const back = item.funnel ? { href: `/app/funnels/${item.funnel.id}`, label: item.funnel.name } : { href: `/app/brands/${item.brandId}`, label: item.brand.name };

  return (
    <div className="mx-auto max-w-7xl">
      <p className="mb-2 text-sm"><Link href={back.href} className="text-brand-600">← {back.label}</Link></p>
      <PageHeader
        title={item.title}
        sub={<span className="flex flex-wrap items-center gap-2"><span className="relative inline-flex"><Badge tone={item.status}>{statusLabel(item.status)}</Badge>{item.status === "approved" && <SparkleBurst once={`${item.id}:${item.version}`} />}</span><Badge tone={item.stage}>{item.stage}</Badge><span>{formatLabel(item.format)}</span>{item.version > 0 && <span>· v{item.version}</span>}{item.dueDate && <span>· due {item.dueDate.toLocaleDateString()}</span>}</span>}
        actions={<>
          {(NEXT[item.status] ?? []).map((n) => (
            <form key={n.status} action={setStatus.bind(null, item.id, n.status)}><Button variant={n.variant ?? "primary"}>{n.label}</Button></form>
          ))}
        </>}
      />

      <JobWatcher active={working} />
      {working && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {job!.kind === "revision" ? "The AI is revising this piece" : "The AI is writing this piece"}. This usually takes 30-90 seconds. You can leave this page.
        </div>
      )}
      {failed && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          The last AI {failed.kind} failed: {failed.error}. It didn&apos;t count toward your plan. Try again.
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Card>
            {item.body ? (
              <>
                <div className="mb-3 flex flex-wrap justify-end gap-2">
                  <CopyButton text={item.body} label="Copy Markdown" />
                  <a href={`/api/export/${item.id}`} className={btnClass("secondary", "sm")}>Download .md</a>
                </div>
                <Editor key={item.version} body={item.body} html={renderMarkdown(item.body)} action={saveBody.bind(null, item.id)} />
              </>
            ) : working ? (
              <div className="py-16 text-center text-slate-500">Draft on its way...</div>
            ) : (
              <div className="py-12 text-center">
                <p className="mb-4 text-slate-600">No draft yet. The AI writer will use the brief, the brand&apos;s voice profile and its proof points.</p>
                <ActionButton action={generateDraft.bind(null, item.id)} pending="Writing draft... (30-90 seconds)">Generate draft</ActionButton>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {qa && (
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Quality check</h2>
                <span className={cx("font-serif text-[34px] leading-none", qa.score >= 80 ? "text-emerald-600" : qa.score >= 60 ? "text-amber-600" : "text-red-600")}>{qa.score}</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {qa.checks.map((c) => (
                  <li key={c.id} className="flex gap-2">
                    <span>{c.status === "pass" ? "✅" : c.status === "warn" ? "⚠️" : "❌"}</span>
                    <div><div className="font-medium">{c.label}</div><div className="text-xs text-slate-500">{c.detail}</div></div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {item.body && !working && (
            <Card>
              <h2 className="font-semibold">Revise with AI</h2>
              <p className="mb-3 text-xs text-slate-500">Paste client feedback or your own notes. Everything else stays the same.</p>
              <ActionForm action={aiRevise.bind(null, item.id)} className="space-y-2">
                <Textarea name="feedback" rows={3} placeholder="Make the intro shorter, add a section on pricing, fix the QA warnings..." />
                <Submit pending="Revising...">Revise</Submit>
              </ActionForm>
            </Card>
          )}

          <Card>
            <h2 className="font-semibold">Brief</h2>
            <dl className="mt-2 space-y-2 text-sm">
              {[["Keyword", item.keyword], ["Angle", item.angle], ["Call to action", item.cta], ["Notes", item.notes], ["Funnel goal", item.funnel?.goal]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><dt className="text-xs font-semibold uppercase text-slate-500">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            {item.body && !working && (
              <div className="mt-3"><ActionButton action={generateDraft.bind(null, item.id)} variant="secondary" size="sm" pending="Rewriting..." confirm="Write a completely new draft? The current one stays in version history.">Write fresh draft</ActionButton></div>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold mb-3">Comments</h2>
            {item.comments.length === 0 ? <Empty>No comments yet.</Empty> : (
              <ul className="space-y-3 text-sm max-h-80 overflow-y-auto">
                {item.comments.map((c) => (
                  <li key={c.id} className={cx("rounded-lg p-2.5", c.fromClient ? "bg-amber-50" : "bg-slate-50")}>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{c.author}{c.fromClient && " (client)"}</span>
                      <span>{c.createdAt.toLocaleString()}</span>
                    </div>
                    {c.kind === "change_request" && <div className="text-xs font-semibold text-red-600 mt-1">Requested changes</div>}
                    {c.kind === "approval" && <div className="text-xs font-semibold text-emerald-700 mt-1">Approved</div>}
                    <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <ActionForm action={addComment.bind(null, item.id)} className="mt-3 space-y-2">
              <Textarea name="body" rows={2} placeholder="Add a note..." />
              <Submit size="sm" variant="secondary">Comment</Submit>
            </ActionForm>
          </Card>

          {item.revisions.length > 0 && (
            <Card>
              <h2 className="font-semibold mb-2">Version history</h2>
              <ul className="divide-y divide-slate-100 text-sm">
                {item.revisions.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0"><span className="font-medium">v{r.version}</span> <span className="text-slate-500 truncate">· {r.reason}</span></div>
                    {r.version !== item.version && <form action={restoreRevision.bind(null, item.id, r.id)}><Button size="sm" variant="ghost">Restore</Button></form>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <form action={deleteItem.bind(null, item.id)}><Button variant="danger" size="sm">Delete this piece</Button></form>
        </div>
      </div>
    </div>
  );
}
