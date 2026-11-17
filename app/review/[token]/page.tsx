import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { clientFeedback } from "@/lib/actions";
import { renderMarkdown } from "@/lib/markdown";
import { formatLabel, statusLabel } from "@/lib/formats";
import { planOf } from "@/lib/plans";
import { ReviewForm } from "@/components/review-form";
import { Badge, Card, Empty } from "@/components/ui";

export const metadata: Metadata = { title: "Content review", robots: { index: false } };

export default async function ReviewPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const brand = await db.brand.findUnique({
    where: { reviewToken: token },
    include: {
      workspace: true,
      items: { where: { status: { in: ["in_review", "changes_requested", "approved", "delivered"] }, body: { not: null } }, orderBy: { updatedAt: "desc" } },
    },
  });
  if (!brand) notFound();
  const whiteLabel = planOf(brand.workspace.plan).whiteLabel;
  const by = brand.workspace.agencyName || brand.workspace.name;
  const open = brand.items.filter((i) => i.status === "in_review");
  const rest = brand.items.filter((i) => i.status !== "in_review");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
          <div className="text-xs text-slate-500">Content review for</div>
          <div className="text-lg font-semibold">{brand.name}</div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
        <section>
          <h2 className="mb-3 font-semibold">Waiting for your review ({open.length})</h2>
          {open.length === 0 ? <Empty>Nothing to review right now.</Empty> : open.map((i) => (
            <Card key={i.id} className="mb-6">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500"><Badge tone={i.stage}>{formatLabel(i.format)}</Badge> version {i.version}</div>
              <div className="prose-ll border-b border-slate-100 pb-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(i.body!) }} />
              <div className="pt-4"><ReviewForm action={clientFeedback.bind(null, token, i.id)} /></div>
            </Card>
          ))}
        </section>
        {rest.length > 0 && (
          <section>
            <h2 className="mb-3 font-semibold">History</h2>
            <Card className="p-0 divide-y divide-slate-100">
              {rest.map((i) => (
                <details key={i.id} className="px-4 py-3">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm"><span className="font-medium">{i.title}</span><Badge tone={i.status}>{statusLabel(i.status)}</Badge></summary>
                  <div className="prose-ll mt-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(i.body!) }} />
                </details>
              ))}
            </Card>
          </section>
        )}
      </main>
      <footer className="py-6 text-center text-xs text-slate-400">{whiteLabel ? by : <>Delivered by {by} · Powered by Leadloom</>}</footer>
    </div>
  );
}
