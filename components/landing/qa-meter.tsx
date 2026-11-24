"use client";

import { useEffect, useRef, useState } from "react";

const CHECKS: [string, "pass" | "warn", string][] = [
  ["Length", "pass", "1,454 words · target 1,200–2,200"],
  ["Readability", "pass", "Reading ease 74 · plain English"],
  ["AI-sounding phrases", "pass", "None found"],
  ["Brand banned words", "pass", "None used"],
  ["Target keyword", "pass", "In title and intro"],
  ["Headings", "pass", "7 sections"],
  ["Call to action", "pass", "Points to the next piece"],
  ["Unsourced statistics", "warn", "“2x” has no source. Verify or cite."],
  ["Long sentences", "warn", "1 sentence over 30 words"],
  ["Facts to fill in", "pass", "No placeholders left"],
];
const SCORE = 92;

/** A real quality report from a Leadloom draft, counting up when it scrolls into view. */
export function QaMeter() {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(SCORE); setShown(CHECKS.length); return; }
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 1600);
        setN(Math.round(SCORE * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      CHECKS.forEach((_, i) => timers.push(setTimeout(() => setShown(i + 1), 140 * i)));
    }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  }, []);

  const dash = 2 * Math.PI * 54;
  return (
    <div ref={ref} className="rounded-[28px] border border-[var(--line)] bg-[#fbf8f2] p-6 shadow-[0_30px_70px_-40px_rgba(28,26,23,.5)] sm:p-8">
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 128 128" className="h-28 w-28 shrink-0 -rotate-90" role="img" aria-label={`Quality score ${SCORE} out of 100`}>
          <circle cx="64" cy="64" r="54" fill="none" stroke="var(--line)" strokeWidth="9" />
          <circle cx="64" cy="64" r="54" fill="none" stroke="var(--ink)" strokeWidth="9" strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={dash * (1 - n / 100)} />
          <text x="64" y="64" transform="rotate(90 64 64)" textAnchor="middle" dominantBaseline="central" className="serif" fontSize="40" fill="var(--ink)">{n}</text>
        </svg>
        <div>
          <p className="mono text-[11px] uppercase text-[var(--ink-2)]">Quality check · blog post</p>
          <p className="serif mt-1 text-2xl leading-tight">Spring lawn care tips for Denver suburbs</p>
        </div>
      </div>
      <ul className="mt-6 divide-y divide-[var(--line)]">
        {CHECKS.map(([label, status, detail], i) => (
          <li key={label} className={`flex items-start gap-3 py-2.5 text-sm transition-all duration-500 ${i < shown ? "opacity-100" : "translate-y-1 opacity-0"}`}>
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${status === "pass" ? "bg-[#dfe8d2] text-[#3c5a2a]" : "bg-[#f6e3bf] text-[#8a5a12]"}`} aria-hidden>{status === "pass" ? "✓" : "!"}</span>
            <span className="font-medium">{label}</span>
            <span className="ml-auto text-right text-[var(--ink-2)]">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
