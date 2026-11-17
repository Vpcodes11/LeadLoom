import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateFunnelDrafts } from "@/lib/actions";
import { STAGES, formatLabel, statusLabel } from "@/lib/formats";
import { ActionButton } from "@/components/forms";
import { Badge, Card, PageHeader } from "@/components/ui";

export default async function FunnelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await requireUser();
  const funnel = await db.funnel.findFirst({
    where: { id, brand: { workspaceId: workspace.id } },
    include: { brand: true, items: { orderBy: { position: "asc" } } },
  });
  if (!funnel) notFound();
  const undrafted = funnel.items.filter((i) => !i.body).length;
  const done = funnel.items.filter((i) => i.status === "approved" || i.status === "delivered").length;

  return (
    <div className="mx-auto max-w-7xl">
      <p className="mb-2 text-sm"><Link href={`/app/brands/${funnel.brandId}`} className="text-brand-600">← {funnel.brand.name}</Link></p>
      <PageHeader
        title={funnel.name}
        sub={<>Goal: {funnel.goal} · {done}/{funnel.items.length} approved</>}
        actions={
          <ActionButton action={generateFunnelDrafts.bind(null, funnel.id)} variant={undrafted ? "primary" : "secondary"} pending={`Writing ${undrafted} pieces... (this can take a few minutes)`}>
            {undrafted ? `Draft all ${undrafted} remaining pieces` : "All pieces drafted"}
          </ActionButton>
        }
      />
      <Card className="mb-6 bg-brand-50/50 border-brand-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">Strategy</div>
        <p className="mt-1 text-sm text-slate-700">{funnel.strategy}</p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {STAGES.map((stage) => {
          const items = funnel.items.filter((i) => i.stage === stage.id);
          return (
            <section key={stage.id}>
              <div className="mb-3">
                <h2 className="font-semibold">{stage.label} <span className="text-slate-400 font-normal">({items.length})</span></h2>
                <p className="text-xs text-slate-500">{stage.hint}</p>
              </div>
              <div className="space-y-3">
                {items.map((i) => (
                  <Link key={i.id} href={`/app/content/${i.id}`} className="block">
                    <Card className="p-4 hover:border-brand-500 transition">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-slate-500">{i.position + 1}. {formatLabel(i.format)}</span>
                        <Badge tone={i.status}>{statusLabel(i.status)}</Badge>
                      </div>
                      <div className="mt-1.5 font-medium leading-snug">{i.title}</div>
                      {i.keyword && <div className="mt-1 text-xs text-slate-500">🔎 {i.keyword}</div>}
                      {i.cta && <div className="mt-2 text-xs text-brand-700">→ {i.cta}</div>}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
