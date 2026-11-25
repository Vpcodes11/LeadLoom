"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-bleed looping background film (muted, inline, no controls).
 * - The poster paints immediately; the film fades in once it can play.
 * - Phones get the 960px encode, larger screens the 1920px one.
 * - Paused while off-screen or in a hidden tab, so it costs nothing out of view.
 * - Reduced-motion and data-saver visitors keep the still poster.
 */
export function BgVideo({ name, position = "center", overlay }: { name: "hero" | "night"; position?: string; overlay: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const motion = src !== null;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    // Pick the encode here: several browsers ignore `media` on a video <source>,
    // which would send the phone-size film to desktops (or the big one to phones).
    const phone = window.matchMedia("(max-width: 767px)").matches;
    setSrc(`/landing/${name}${phone ? "-960" : ""}.mp4`);
  }, [name]);

  useEffect(() => {
    const v = ref.current;
    if (!motion || !v) return;
    let visible = false;
    const sync = () => { if (visible && !document.hidden) void v.play().catch(() => {}); else v.pause(); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { rootMargin: "200px 0px" });
    io.observe(v);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [motion]);

  const poster = `/landing/${name}-poster.webp`;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- the poster must paint before hydration */}
      <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} fetchPriority={name === "hero" ? "high" : "auto"} />
      {src && (
        <video
          ref={ref}
          src={src}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition: position }}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          onCanPlay={() => setReady(true)}
        />
      )}
      <div className="absolute inset-0" style={{ background: overlay }} />
      <div className="ll-grain absolute inset-0" />
    </div>
  );
}
