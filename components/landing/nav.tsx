"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#quality", label: "Quality" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

/** Floating glass pill. Turns ink-dark once the hero has scrolled away so it stays readable on paper. */
export function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > window.innerHeight * 0.75);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-5">
      <nav className={`flex w-full max-w-3xl items-center justify-between gap-2 rounded-full py-1.5 pl-5 pr-1.5 text-[13px] transition-colors duration-500 ${solid ? "glass-dark text-white" : "glass text-white"}`} aria-label="Main">
        <Link href="/" className="serif text-[22px] leading-none tracking-tight" aria-label="Leadloom home">Leadloom</Link>
        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => <a key={l.href} href={l.href} className="opacity-85 transition hover:opacity-100">{l.label}</a>)}
        </div>
        <div className="flex items-center gap-1">
          <Link href="/login" className="hidden rounded-full px-3.5 py-2 opacity-90 transition hover:bg-white/10 sm:inline-block">Log in</Link>
          <Link href="/signup" className="btn-light rounded-full px-4 py-2 font-medium">Start free</Link>
        </div>
      </nav>
    </header>
  );
}
