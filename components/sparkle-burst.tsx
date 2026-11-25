"use client";

import { useEffect, useState } from "react";

/**
 * A small one-shot burst of warm sparkles, for the moment a piece is approved.
 * Pure CSS (transform/opacity), removed after it plays, skipped with reduced motion.
 * Pass `once` to play it only the first time this browser sees that key (e.g. an item id).
 */
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + (i % 2 ? 0.18 : 0);
  const r = i % 2 ? 46 : 64;
  return { x: `${Math.round(Math.cos(a) * r)}px`, y: `${Math.round(Math.sin(a) * r)}px`, s: `${i % 3 ? 7 : 10}px`, d: `${(i % 4) * 30}ms` };
});

export function SparkleBurst({ once }: { once?: string }) {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (once) {
      const key = `ll-burst:${once}`;
      try { if (localStorage.getItem(key)) return; localStorage.setItem(key, "1"); } catch { /* storage blocked: just play */ }
    }
    setPlay(true);
    const t = window.setTimeout(() => setPlay(false), 1400);
    return () => window.clearTimeout(t);
  }, [once]);
  if (!play) return null;
  return (
    <span className="ll-burst" aria-hidden>
      {RAYS.map((r, i) => (
        <span key={i} style={{ "--x": r.x, "--y": r.y, "--s": r.s, animationDelay: r.d } as React.CSSProperties} />
      ))}
    </span>
  );
}
