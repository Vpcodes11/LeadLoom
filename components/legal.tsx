import Link from "next/link";
import type { ReactNode } from "react";
import { Ambience } from "./landing/ambience";
import { llFonts } from "./landing/fonts";
import "@/app/landing.css";

export const UPDATED = "November 24, 2026";

export function contactLine() {
  const email = process.env.SUPPORT_EMAIL;
  return email ? <a href={`mailto:${email}`} className="text-brand-600 underline">{email}</a> : "the contact address on our website";
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={`ll ${llFonts} min-h-screen pt-3 sm:pt-5`}>
      {/* Scenic header band: the golden-hour scene, a couple of birds and a few sparkles, then plain text. */}
      <header className="relative mx-3 h-56 overflow-hidden rounded-[28px] bg-[#4f6a95] text-white sm:mx-5 sm:h-64">
        {/* eslint-disable-next-line @next/next/no-img-element -- static poster */}
        <img src="/landing/hero-poster.webp" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 66%" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,16,30,.42)] via-[rgba(10,16,30,.18)] to-[rgba(10,16,30,.38)]" />
        <Ambience scene="band" />
        <div className="relative mx-auto flex h-full max-w-3xl flex-col px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="serif text-[24px] leading-none ll-text-shadow" aria-label="Leadloom home">Leadloom</Link>
            <Link href="/" className="glass-lite rounded-full px-3.5 py-1.5 text-[13px]">Home</Link>
          </div>
          <div className="mt-auto">
            <h1 className="serif text-[44px] leading-none ll-text-shadow sm:text-[56px]">{title}</h1>
            <p className="mono mt-3 text-[11px] uppercase text-white/85">Last updated {UPDATED}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-6">
        <div className="prose-ll [&_h2]:mt-10">{children}</div>
      </main>
    </div>
  );
}
