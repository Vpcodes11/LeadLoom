import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Card, Empty, LinkButton, PageHeader } from "@/components/ui";
import { formatLabel, statusLabel } from "@/lib/formats";

export default async function Dashboard() {
  const { workspace, user } = await requireUser();
  const [brands, counts, attention] = await Promise.all([
    db.brand.findMany({ where: { workspaceId: workspace.id }, include: { _count: { select: { items: true, funnels: true } } }, orderBy: { createdAt: "asc" } }),
    db.contentItem.groupBy({ by: ["status"], where: { brand: { workspaceId: workspace.id } }, _count: true }),
    db.contentItem.findMany({
      where: { brand: { workspaceId: workspace.id }, status: { in: ["requested", "changes_requested", "approved"] } },
      include: { brand: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 8,
    }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const stats = [
    { label: "To write", value: count("requested") + count("planned") },
    { label: "Drafts", value: count("draft") },
    { label: "With client", value: count("in_review") },
    { label: "Needs changes", value: count("changes_requested") },
    { label: "Approved", value: count("approved") },
    { label: "Delivered", value: count("delivered") },
  ];

  if (brands.length === 0) {
    return (
      <div className="mx-auto max-w-xl pt-10 text-center">
        <h1 className="text-2xl font-bold">Welcome, {user.name.split(" ")[0]} 👋</h1>
        <p className="mt-2 text-slate-600">Start by adding a brand: the business you&apos;re creating content for. It takes about 3 minutes.</p>
        <LinkButton href="/app/brands/new" className="mt-6">Add a brand</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Dashboard" sub={workspace.name} actions={<LinkButton href="/app/brands/new" variant="secondary">Add brand</LinkButton>} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">Needs your attention</h2>
          {attention.length === 0 ? <Empty>Nothing waiting. Nice.</Empty> : (
            <Card className="p-0 divide-y divide-slate-100">
              {attention.map((i) => (
                <Link key={i.id} href={`/app/content/${i.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{i.title}</div>
                    <div className="text-xs text-slate-500">{i.brand.name} · {formatLabel(i.format)}</div>
                  </div>
                  <Badge tone={i.status}>{statusLabel(i.status)}</Badge>
                </Link>
              ))}
            </Card>
          )}
        </section>
        <section>
          <h2 className="mb-3 font-semibold">Brands</h2>
          <div className="grid gap-3">
            {brands.map((b) => (
              <Link key={b.id} href={`/app/brands/${b.id}`}>
                <Card className="hover:border-brand-500 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{b.name}</span>
                    {!b.voiceProfile && <Badge tone="changes_requested">No voice profile</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{b._count.funnels} funnels · {b._count.items} pieces</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
