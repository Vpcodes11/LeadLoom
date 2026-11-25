import type { ReactNode } from "react";
import Link from "next/link";
import { BgVideo } from "./landing/bg-video";
import { Ambience } from "./landing/ambience";
import { llFonts } from "./landing/fonts";
import "@/app/landing.css";

/**
 * Sign-in, sign-up, password reset and invite pages.
 * Large screens: the form on paper at the left, the golden-hour film with its birds, butterflies and
 * lamp sparkles at the right. Phones: a short scenic strip above the form. The form side stays calm.
 */
export function AuthShell({ title, sub, children, footer }: { title: string; sub?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className={`ll ${llFonts} min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]`}>
      {/* Phone strip */}
      <div className="relative mx-3 mt-3 h-44 overflow-hidden rounded-[28px] bg-[#4f6a95] lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- static poster, painted before hydration */}
        <img src="/landing/hero-poster.webp" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 62%" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,16,30,.35)] to-[rgba(10,16,30,.05)]" />
        <Ambience scene="band" />
        <Link href="/" className="serif absolute left-5 top-4 text-[24px] leading-none text-white ll-text-shadow" aria-label="Leadloom home">Leadloom</Link>
      </div>

      {/* Form */}
      <div className="flex min-h-[calc(100svh-12rem)] flex-col px-5 py-8 sm:px-10 lg:min-h-screen lg:py-10">
        <Link href="/" className="serif hidden text-[26px] leading-none tracking-tight lg:inline-block" aria-label="Leadloom home">Leadloom</Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="serif text-[40px] leading-[1.05] sm:text-[44px]">{title}</h1>
          {sub ? <p className="mt-2 mb-6 text-[15px] leading-6 text-[var(--ink-2)]">{sub}</p> : <div className="mb-6" />}
          <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-5 shadow-[0_20px_50px_-30px_rgba(28,26,23,.35)]">{children}</div>
          {footer && <p className="mt-5 text-center text-sm text-[var(--ink-2)]">{footer}</p>}
        </div>
        <p className="mono mt-8 text-center text-[11px] uppercase text-[var(--ink-2)] opacity-70 lg:text-left">
          <Link href="/terms" className="hover:underline">Terms</Link> · <Link href="/privacy" className="hover:underline">Privacy</Link> · <Link href="/refund-policy" className="hover:underline">Refunds</Link>
        </p>
      </div>

      {/* Scene (large screens) */}
      <aside className="relative m-4 hidden overflow-hidden rounded-[32px] bg-[#4f6a95] text-white lg:block lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]" aria-hidden>
        <BgVideo name="hero" position="50% 70%" overlay="linear-gradient(180deg, rgba(10,16,30,.42) 0%, rgba(10,16,30,.12) 38%, rgba(10,16,30,.04) 62%, rgba(8,12,6,.4) 100%)" />
        <Ambience scene="day" />
        <div className="absolute inset-x-0 top-0 p-10 xl:p-12">
          <p className="glass-lite mono inline-block rounded-full px-3 py-1.5 text-[11px] uppercase">For marketing &amp; SEO agencies</p>
          <p className="serif mt-5 max-w-md text-[44px] leading-[1.02] ll-text-shadow xl:text-[52px]">Content that <em>leads</em> somewhere.</p>
        </div>
      </aside>
    </div>
  );
}
