"use client";

import { useEffect, useRef } from "react";

/**
 * Painted landscape drawn in SVG: layered hills, wildflowers, a writing desk with a lamp, and
 * golden threads that gather from the whole sky into the lamp (wide interest → one customer).
 * Threads sway and "leads" travel down them. Static when the user prefers reduced motion,
 * paused when off-screen or when the tab is hidden.
 */

type Variant = "dawn" | "night";
const W = 1600;
const H = 900;
const DROP = 64; // the landscape sits lower than the sky so the hero copy has room
const LAMP = { x: 800, y: 612 + DROP };
const THREADS = 13;
const LEADS = 18;

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r = rng(11);
// Depth: far flowers are tiny and faint, near ones large.
const FLOWERS = Array.from({ length: 560 }, () => {
  const depth = Math.pow(r(), 0.55); // 0 far ... 1 near
  const y = 730 + depth * 175;
  return { x: r() * W, y, s: 0.8 + depth * 4.2 * (0.55 + r() * 0.7), c: Math.floor(r() * 4), o: 0.45 + depth * 0.5, rot: Math.round(r() * 180) };
});
const GRASS = Array.from({ length: 240 }, () => {
  const depth = Math.pow(r(), 0.6);
  return { x: r() * W, y: 735 + depth * 170, h: 5 + depth * 16, lean: (r() - 0.5) * 8 };
});
const STARS = Array.from({ length: 170 }, () => ({ x: r() * W, y: Math.pow(r(), 1.4) * 520, s: 0.4 + r() * 1.3, o: 0.35 + r() * 0.65 }));
const TOPS = Array.from({ length: THREADS }, (_, i) => ({ x: 60 + (i / (THREADS - 1)) * (W - 120), y: -60 + r() * 110, ph: r() * Math.PI * 2, cross: i % 2 ? 1 : -1 }));

const PALETTE = {
  dawn: {
    sky: ["#3f5f96", "#7f93be", "#d9bfc4", "#f6d3a2"], sun: "#ffe2a8", mountains: "#a9a6c6", far: "#93a57c", mid: "#6f8b57", near: "#4f6c3d",
    nearDeep: "#38512c", haze: "#fbe6cc", flowers: ["#f4b74a", "#f7ead0", "#c9a0d8", "#ec7f4f"], thread: "#ffd98a", desk: "#3b2a1f", glow: "#ffcf7a",
  },
  night: {
    sky: ["#050a19", "#0b1733", "#1a2c57", "#33406e"], sun: "#9fb4ff", mountains: "#1e2a4d", far: "#16223c", mid: "#111b30", near: "#0c1424",
    nearDeep: "#080e1a", haze: "#2a3766", flowers: ["#f2b046", "#f7d98f", "#9b8ad9", "#e8814a"], thread: "#ffc867", desk: "#05080f", glow: "#ffbf5c",
  },
} as const;

function threadPath(i: number, t: number) {
  const top = TOPS[i];
  const sway = Math.sin(t * 0.5 + top.ph) * 40;
  const sway2 = Math.cos(t * 0.38 + top.ph) * 26;
  // Alternate threads bow left/right so neighbours cross each other, like warp and weft.
  const c1x = top.x + sway + top.cross * 140;
  const c2x = LAMP.x + (top.x - LAMP.x) * 0.18 - top.cross * 70 + sway2;
  return { p0: [top.x, top.y], p1: [c1x, 340], p2: [c2x, 540 + DROP / 2], p3: [LAMP.x, LAMP.y] } as const;
}

function bez(a: number, b: number, c: number, d: number, u: number) {
  const v = 1 - u;
  return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d;
}

export function Scene({ variant = "dawn", className = "" }: { variant?: Variant; className?: string }) {
  const pal = PALETTE[variant];
  const svgRef = useRef<SVGSVGElement>(null);
  const id = `sc-${variant}`;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("[data-thread]"));
    const dots = Array.from(svg.querySelectorAll<SVGCircleElement>("[data-lead]"));
    const seed = rng(variant === "dawn" ? 3 : 5);
    const leads = dots.map(() => ({ i: Math.floor(seed() * THREADS), u: seed(), v: 0.0009 + seed() * 0.0016 }));
    const draw = (t: number) => {
      paths.forEach((p, i) => {
        // Each thread is drawn twice (soft glow + sharp line), so paths repeat every THREADS.
        const { p0, p1, p2, p3 } = threadPath(i % THREADS, t);
        p.setAttribute("d", `M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`);
      });
      leads.forEach((l, k) => {
        const { p0, p1, p2, p3 } = threadPath(l.i, t);
        const x = bez(p0[0], p1[0], p2[0], p3[0], l.u);
        const y = bez(p0[1], p1[1], p2[1], p3[1], l.u);
        dots[k].setAttribute("cx", x.toFixed(1));
        dots[k].setAttribute("cy", y.toFixed(1));
        dots[k].setAttribute("opacity", String(Math.min(1, l.u * 3) * (1 - Math.pow(l.u, 6))));
      });
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    draw(0);
    if (reduce) return;

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let clock = 0;
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      clock += dt / 1000;
      leads.forEach((l) => { l.u += l.v * dt * 0.06; if (l.u >= 1) { l.u = 0; l.i = Math.floor(seed() * THREADS); } });
      draw(clock);
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); });
    io.observe(svg);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => { stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [variant]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            {pal.sky.map((c, i) => <stop key={c} offset={[0, 0.38, 0.62, 0.8][i]} stopColor={c} />)}
          </linearGradient>
          <radialGradient id={`${id}-sun`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={pal.sun} stopOpacity={variant === "dawn" ? 0.95 : 0.35} />
            <stop offset="1" stopColor={pal.sun} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-near`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={pal.near} /><stop offset="1" stopColor={pal.nearDeep} />
          </linearGradient>
          <linearGradient id={`${id}-thread`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={LAMP.y}>
            <stop offset="0" stopColor={pal.thread} stopOpacity="0" />
            <stop offset="0.5" stopColor={pal.thread} stopOpacity="0.22" />
            <stop offset="1" stopColor={pal.thread} stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={pal.glow} stopOpacity="0.95" />
            <stop offset="0.35" stopColor={pal.glow} stopOpacity="0.35" />
            <stop offset="1" stopColor={pal.glow} stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-blur`}><feGaussianBlur stdDeviation="3" /></filter>
          <filter id={`${id}-soft`}><feGaussianBlur stdDeviation="2.2" /></filter>
          <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={pal.haze} stopOpacity="0" />
            <stop offset="0.55" stopColor={pal.haze} stopOpacity={variant === "dawn" ? 0.55 : 0.35} />
            <stop offset="1" stopColor={pal.haze} stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${id}-nearclip`}><path d="M0 724 C 300 660, 600 716, 820 700 S 1300 650, 1600 708 L1600 960 L0 960Z" /></clipPath>
        </defs>

        <rect width={W} height={H} fill={`url(#${id}-sky)`} />
        {variant === "night" && STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={s.o} className={i % 5 === 0 ? "ll-twinkle" : undefined} style={{ animationDelay: `${(i % 7) * 0.7}s` }} />)}
        <ellipse cx="1170" cy={585 + DROP} rx="460" ry="260" fill={`url(#${id}-sun)`} />
        <g transform={`translate(0 ${DROP})`}>
          <path filter={`url(#${id}-soft)`} d="M0 570 C 90 540, 140 500, 200 496 C 260 492, 300 540, 360 532 C 430 522, 470 452, 540 448 C 610 444, 650 520, 720 524 C 800 528, 850 478, 920 480 C 990 482, 1030 548, 1100 546 C 1180 544, 1230 462, 1300 458 C 1380 454, 1420 520, 1490 522 C 1540 523, 1570 500, 1600 494 L1600 960 L0 960Z" fill={pal.mountains} opacity={variant === "dawn" ? 0.5 : 0.9} />
          <rect x="0" y="470" width={W} height="170" fill={`url(#${id}-haze)`} />
          <path d="M0 612 C 300 552, 600 590, 900 572 S 1400 532, 1600 572 L1600 960 L0 960Z" fill={pal.far} />
          <rect x="0" y="560" width={W} height="110" fill={`url(#${id}-haze)`} opacity="0.6" />
          <path d="M0 652 C 250 610, 520 632, 760 660 S 1250 612, 1600 636 L1600 960 L0 960Z" fill={pal.mid} />
        </g>

        <g filter={`url(#${id}-blur)`} opacity="0.8">
          {Array.from({ length: THREADS }, (_, i) => <path key={i} data-thread="" fill="none" stroke={`url(#${id}-thread)`} strokeWidth="2" />)}
        </g>
        <g>
          {Array.from({ length: THREADS }, (_, i) => <path key={i} data-thread="" fill="none" stroke={`url(#${id}-thread)`} strokeWidth="0.75" />)}
        </g>
        <g fill={pal.thread}>
          {Array.from({ length: LEADS }, (_, i) => <circle key={i} data-lead="" r="2.1" cx={LAMP.x} cy={LAMP.y} opacity="0" />)}
        </g>

        {/* desk and lamp */}
        <ellipse cx={LAMP.x} cy={LAMP.y} rx="120" ry="90" fill={`url(#${id}-glow)`} />
        <g fill={pal.desk} transform={`translate(0 ${DROP})`}>
          <rect x="752" y="636" width="96" height="6" rx="2" />
          <rect x="758" y="642" width="4" height="22" /><rect x="838" y="642" width="4" height="22" />
          <rect x="771" y="626" width="22" height="10" rx="1.5" opacity="0.85" />
          <rect x="812" y="622" width="3" height="14" />
          <path d="M803 612 h22 l-5 10 h-12z" />
          <circle cx="814" cy="618" r="4" fill={pal.glow} />
        </g>

        <g transform={`translate(0 ${DROP})`}>
          <path d="M0 724 C 300 660, 600 716, 820 700 S 1300 650, 1600 708 L1600 960 L0 960Z" fill={`url(#${id}-near)`} />
          <g clipPath={`url(#${id}-nearclip)`}>
            <g stroke={pal.nearDeep} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.55">
              {GRASS.map((g, i) => <path key={i} d={`M${g.x.toFixed(1)} ${g.y.toFixed(1)} q ${(g.lean / 2).toFixed(1)} ${(-g.h / 2).toFixed(1)} ${g.lean.toFixed(1)} ${(-g.h).toFixed(1)}`} />)}
            </g>
            {FLOWERS.map((f, i) => (
              <ellipse key={i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} rx={f.s.toFixed(2)} ry={(f.s * 0.72).toFixed(2)} transform={`rotate(${f.rot} ${f.x.toFixed(1)} ${f.y.toFixed(1)})`} fill={pal.flowers[f.c]} opacity={(variant === "night" ? f.o * 0.8 : f.o).toFixed(2)} />
            ))}
          </g>
        </g>
      </svg>
      {variant === "dawn" && (
        <>
          <div className="ll-cloud" style={{ left: "6%", top: "16%", width: "30%", height: "16%" }} />
          <div className="ll-cloud ll-cloud-slow" style={{ left: "58%", top: "10%", width: "36%", height: "20%" }} />
          <div className="ll-cloud" style={{ left: "34%", top: "34%", width: "22%", height: "10%", animationDelay: "-20s" }} />
        </>
      )}
      <div className="ll-grain absolute inset-0" />
    </div>
  );
}
