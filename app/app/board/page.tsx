import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { STATUSES, formatLabel } from "@/lib/formats";
import { Badge, Card, PageHeader } from "@/components/ui";

export default async function Board() {
  const { workspace } = await requireUser();
  const items = await db.contentItem.findMany({
    where: { brand: { workspaceId: workspace.id } },
    include: { brand: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div>
      <PageHeader title="Content board" sub="Every piece across all brands, by stage of production." />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((s) => {
          const col = items.filter((i) => i.status === s.id);
          return (
            <section key={s.id} className="w-64 shrink-0">
              <h2 className="mb-2 flex items-center justify-between text-sm font-semibold">{s.label}<span className="text-slate-400 font-normal">{col.length}</span></h2>
              <div className="space-y-2">
                {col.map((i) => (
                  <Link key={i.id} href={`/app/content/${i.id}`} className="block">
                    <Card className="p-3 hover:border-brand-500 transition">
                      <div className="text-sm font-medium leading-snug">{i.title}</div>
                      <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="truncate">{i.brand.name}</span><Badge tone={i.stage}>{formatLabel(i.format)}</Badge>
                      </div>
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
