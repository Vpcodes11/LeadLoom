"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  { k: "Voice", t: "It learns how each client sounds.", d: "Paste a few things the brand has written. Leadloom builds a voice profile: tone, the words they use, the words they never would, and real sample lines. Every draft is written to it.", img: "/product/brand.png", alt: "Brand page with a learned voice profile" },
  { k: "Plan", t: "It plans content that leads somewhere.", d: "Give it a goal like “book 30 consultations this quarter.” It maps a connected funnel across awareness, consideration and decision. Each piece points the reader to the next.", img: "/product/funnel.png", alt: "Funnel map with pieces across three stages" },
  { k: "Write", t: "It drafts in six formats, using only real facts.", d: "Blogs, landing pages, five-email sequences, case studies, LinkedIn posts and newsletters. It uses only the proof points you give it. A missing number becomes [ADD METRIC], never an invented stat.", img: "/product/content-editor.png", alt: "Draft editor with a quality score" },
  { k: "Approve", t: "Clients approve with one link.", d: "No logins and no email threads. Clients read on their phone and tap Approve or Request changes. Their feedback lands on your board. White-label on the Agency plan.", img: "/product/board.png", alt: "Production board with every piece and stage" },
];

/** Scroll story: the copy scrolls, the framed screenshot stays put and crossfades to match. */
export function Steps() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <ol className="space-y-6 lg:space-y-0">
        {STEPS.map((s, i) => (
          <li key={s.k}>
            <div ref={(el) => { refs.current[i] = el; }} data-i={i} className={`flex flex-col justify-center transition-opacity duration-500 lg:min-h-[70vh] ${active === i ? "opacity-100" : "lg:opacity-35"}`}>
              <p className="mono text-[11px] uppercase text-[var(--ink-2)]">0{i + 1} · {s.k}</p>
              <h3 className="serif mt-3 text-[34px] leading-[1.05] sm:text-[42px]">{s.t}</h3>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-[var(--ink-2)]">{s.d}</p>
              <div data-rise3d className="frame mt-6 lg:hidden">
                <div className="screen"><Image src={s.img} alt={s.alt} width={2880} height={1800} sizes="100vw" className="h-auto w-full" /></div>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="hidden lg:block">
        <div className="sticky top-[14vh]">
          <div data-hover-tilt className="frame">
            {/* Each screenshot flips in depth: past steps tilt up and away, upcoming ones wait tilted below. */}
            <div className="screen relative aspect-[16/10] [perspective:1600px]">
              {STEPS.map((s, i) => (
                <Image key={s.img} src={s.img} alt={s.alt} fill sizes="55vw" className={`ll-flip object-cover object-top ${i < active ? "ll-flip-past" : i > active ? "ll-flip-next" : "ll-flip-now"}`} />
              ))}
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            {STEPS.map((s, i) => <span key={s.k} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-[var(--ink)]" : "bg-[var(--line)]"}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
