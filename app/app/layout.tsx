import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "@/lib/actions";
import { Logo } from "@/components/logo";
import { planOf } from "@/lib/plans";
import { piecesUsed } from "@/lib/usage";
import { aiEnabled } from "@/lib/ai";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace } = await requireUser();
  const brands = await db.brand.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "asc" }, select: { id: true, name: true } });
  const plan = planOf(workspace.plan);
  const used = await piecesUsed(workspace.id, workspace.plan);
  const nav = [
    { href: "/app", label: "Dashboard" },
    { href: "/app/board", label: "Content board" },
    { href: "/app/billing", label: "Billing" },
    { href: "/app/settings", label: "Settings" },
  ];
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b md:border-b-0 md:border-r border-slate-200 bg-white md:w-60 md:shrink-0 md:min-h-screen p-4 flex md:flex-col gap-4 overflow-x-auto">
        <Logo href="/app" />
        <nav className="flex md:flex-col gap-1 text-sm">
          {nav.map((n) => <Link key={n.href} href={n.href} className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 whitespace-nowrap">{n.label}</Link>)}
        </nav>
        <div className="hidden md:block">
          <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Brands <Link href="/app/brands/new" className="text-brand-600 normal-case text-sm" title="Add brand">+</Link>
          </div>
          <div className="mt-1 flex flex-col gap-0.5 text-sm">
            {brands.map((b) => <Link key={b.id} href={`/app/brands/${b.id}`} className="truncate rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100">{b.name}</Link>)}
            {brands.length === 0 && <Link href="/app/brands/new" className="px-2 py-1.5 text-brand-600">Add your first brand</Link>}
          </div>
        </div>
        <div className="hidden md:block mt-auto space-y-3 text-xs text-slate-500">
          {!aiEnabled() && <p className="rounded-md bg-amber-50 p-2 text-amber-800">Demo mode: set GEMINI_API_KEY (free) or ANTHROPIC_API_KEY for real AI output.</p>}
          <div>
            <div className="flex justify-between"><span>{plan.name} plan</span><span>{used}/{plan.piecesPerMonth} pieces</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${Math.min(100, (used / plan.piecesPerMonth) * 100)}%` }} /></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="truncate">{user.name}</span>
            <form action={logout}><button className="text-slate-600 hover:underline cursor-pointer">Log out</button></form>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 sm:p-8">{children}</main>
    </div>
  );
}
