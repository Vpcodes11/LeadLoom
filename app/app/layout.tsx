import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "@/lib/actions";
import { Logo } from "@/components/logo";
import { AppNav } from "@/components/app-nav";
import { Ambience } from "@/components/landing/ambience";
import { llFonts } from "@/components/landing/fonts";
import "@/app/landing.css";
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
  const brandLinks = brands.map((b) => ({ href: `/app/brands/${b.id}`, label: b.name }));
  return (
    <div className="min-h-screen md:flex">
      <aside className="flex gap-3 overflow-x-auto border-b border-[rgba(28,26,23,0.08)] bg-paper-2/70 p-3 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:flex-col md:gap-5 md:overflow-y-auto md:border-b-0 md:border-r md:p-4">
        {/* Golden-hour card: the landing scene in miniature, with a bird or two and rising sparkles. */}
        <Link href="/app" className={`ll ${llFonts} relative hidden h-28 shrink-0 overflow-hidden rounded-[22px] bg-[#4f6a95] text-white md:block`} aria-label="Leadloom dashboard">
          {/* eslint-disable-next-line @next/next/no-img-element -- static poster */}
          <img src="/landing/hero-poster.webp" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 64%" }} />
          <span className="absolute inset-0 bg-gradient-to-b from-[rgba(10,16,30,.4)] to-[rgba(10,16,30,.1)]" />
          <Ambience scene="band" />
          <span className="serif absolute left-4 top-3.5 text-[26px] leading-none ll-text-shadow">Leadloom</span>
          <span className="mono absolute bottom-3 left-4 text-[10px] uppercase text-white/85">{workspace.name}</span>
        </Link>
        <div className="shrink-0 self-center md:hidden"><Logo href="/app" /></div>
        <AppNav links={nav} className="flex gap-1 text-sm md:flex-col" />
        <div className="hidden md:block">
          <div className="flex items-center justify-between px-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Brands <Link href="/app/brands/new" className="rounded-full px-2 text-base leading-none text-brand-600 hover:bg-white/70" title="Add brand">+</Link>
          </div>
          <AppNav links={brandLinks} className="mt-1.5 flex flex-col gap-0.5 text-sm" />
          {brands.length === 0 && <Link href="/app/brands/new" className="block px-3 py-1.5 text-sm text-brand-600">Add your first brand</Link>}
        </div>
        <div className="hidden md:mt-auto md:block md:space-y-3 text-xs text-slate-500">
          {!aiEnabled() && <p className="rounded-xl bg-brand-50 p-2.5 text-brand-700">Demo mode: set GEMINI_API_KEY (free) or ANTHROPIC_API_KEY for real AI output.</p>}
          <div className="rounded-2xl bg-white/70 p-3">
            <div className="flex justify-between"><span>{plan.name} plan</span><span>{used}/{plan.piecesPerMonth} pieces</span></div>
            <div className="mt-2 h-1.5 rounded-full bg-paper-2"><div className="h-1.5 rounded-full bg-gradient-to-r from-amber to-brand-600" style={{ width: `${Math.min(100, (used / plan.piecesPerMonth) * 100)}%` }} /></div>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="truncate">{user.name}</span>
            <form action={logout}><button className="cursor-pointer text-slate-600 hover:text-ink hover:underline">Log out</button></form>
          </div>
          <Link href="/" className="block px-1 font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-ink">← Leadloom home</Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
