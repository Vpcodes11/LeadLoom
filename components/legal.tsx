import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./logo";

export const UPDATED = "November 17, 2026";

export function contactLine() {
  const email = process.env.SUPPORT_EMAIL;
  return email ? <a href={`mailto:${email}`} className="text-brand-600 underline">{email}</a> : "the contact address on our website";
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6 py-5">
        <Logo />
        <Link href="/" className="text-sm text-slate-600 hover:underline">Home</Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {UPDATED}</p>
        <div className="prose-ll mt-8 [&_h2]:mt-10">{children}</div>
      </main>
    </div>
  );
}
