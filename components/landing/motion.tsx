"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * All landing-page motion in one place, driven by data attributes in the markup:
 *   data-hero / data-sheet         curtain: the page (data-sheet) slides up over the pinned hero film
 *   data-split                     headline words rise out of a blur
 *   data-rise3d                    a frame that tilts back in perspective and straightens on scroll
 *   data-hover-tilt                follows the mouse in 3D (desktop, fine pointers only)
 *   data-count                     number counts up when it scrolls into view
 *   data-fan / data-fan-card       cards fan in with depth; data-featured lifts forward
 * Scrolling is native (no smooth-scroll library); ScrollTrigger reads the real scroll position.
 * With reduced motion none of this runs and the page stays fully static and readable.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.remove("ll-motion");
      return;
    }
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Native scrolling (no smooth-scroll library): the browser's own scroll is the smoothest there is.
    // Anchor links glide with CSS scroll-behavior; section scroll margins clear the floating nav.

    const mm = gsap.matchMedia();
    mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (ctx) => {
      const desktop = Boolean(ctx.conditions?.desktop);

      // Headline: words rise out of a soft blur, one after another.
      const h1 = document.querySelector<HTMLElement>("[data-split]");
      if (h1) {
        const split = SplitText.create(h1, { type: "words", aria: "auto" });
        gsap.set(h1, { opacity: 1 });
        gsap.from(split.words, { yPercent: 45, opacity: 0, filter: "blur(10px)", duration: 1.1, ease: "power3.out", stagger: 0.07, delay: 0.1 });
      }

      // Curtain: the hero is pinned (CSS position: sticky) and the page slides up over it as a sheet.
      // The scroll itself is native, so it is as smooth as the browser; the film is never transformed.
      // Here we only dim the film and lift the hero copy (opacity/transform on light layers), and once
      // the sheet covers the hero we stop the film and hide it so it costs nothing further down.
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const heroContent = document.querySelector<HTMLElement>("[data-hero-content]");
      const dim = document.querySelector<HTMLElement>("[data-hero-dim]");
      const sheet = document.querySelector<HTMLElement>("[data-sheet]");
      if (hero && sheet) {
        const rising = { trigger: sheet, start: "top bottom", end: "top top", scrub: true };
        if (dim) gsap.fromTo(dim, { opacity: 0 }, { opacity: 0.55, ease: "none", scrollTrigger: rising });
        if (heroContent) gsap.to(heroContent, { y: desktop ? -80 : -40, opacity: 0, ease: "none", scrollTrigger: { ...rising, end: "top 35%" } });

        const covered = (on: boolean) => {
          hero.dataset.frozen = on ? "1" : "";
          hero.style.visibility = on ? "hidden" : "";
          const film = hero.querySelector("video");
          if (!film) return;
          if (on) film.pause();
          else if (!document.hidden) void film.play().catch(() => {});
        };
        ScrollTrigger.create({ trigger: sheet, start: "top top+=1", onEnter: () => covered(true), onLeaveBack: () => covered(false) });
      }

      // Frames start tilted back in perspective and straighten as they arrive.
      gsap.utils.toArray<HTMLElement>("[data-rise3d]").forEach((el) => {
        gsap.fromTo(el,
          { rotateX: desktop ? 24 : 10, y: desktop ? 110 : 50, scale: 0.92, opacity: 0.35, transformPerspective: 1400, transformOrigin: "50% 0%" },
          { rotateX: 0, y: 0, scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 98%", end: desktop ? "top 35%" : "top 60%", scrub: true } });
      });

      // Mouse tilt on desktop with a real mouse.
      const cleanups: (() => void)[] = [];
      if (desktop && window.matchMedia("(pointer: fine)").matches) {
        gsap.utils.toArray<HTMLElement>("[data-hover-tilt]").forEach((el) => {
          gsap.set(el, { transformPerspective: 1200 });
          const rx = gsap.quickTo(el, "rotateX", { duration: 0.6, ease: "power3.out" });
          const ry = gsap.quickTo(el, "rotateY", { duration: 0.6, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 7);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
          };
          const leave = () => { rx(0); ry(0); };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); });
        });
      }

      // Numbers count up from zero when they scroll into view.
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        // Keep the real value: this setup re-runs at breakpoint changes, after the text has been set to 0.
        el.dataset.countFinal ??= el.textContent ?? "";
        const final = el.dataset.countFinal;
        cleanups.push(() => { el.textContent = final; });
        const m = final.match(/^(\D*)([\d.]+)(.*)$/);
        if (!m) return;
        const [, pre, num, post] = m;
        const target = Number(num);
        const decimals = (num.split(".")[1] ?? "").length;
        const state = { v: 0 };
        el.textContent = `${pre}${(0).toFixed(decimals)}${post}`;
        // Started by an IntersectionObserver, not a ScrollTrigger: the browser decides visibility, so
        // a trigger measured before the films and fonts settled can never leave the number at 0.
        let tween: gsap.core.Tween | undefined;
        const io = new IntersectionObserver(([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          tween = gsap.to(state, {
            v: target, duration: 1.6, ease: "power2.out",
            onUpdate: () => { el.textContent = `${pre}${state.v.toFixed(decimals)}${post}`; },
          });
        }, { rootMargin: "0px 0px -15% 0px" });
        io.observe(el);
        cleanups.push(() => { io.disconnect(); tween?.kill(); });
      });

      // Pricing cards fan in with depth; the featured plan lifts forward.
      gsap.utils.toArray<HTMLElement>("[data-fan]").forEach((fan) => {
        const cards = gsap.utils.toArray<HTMLElement>(fan.querySelectorAll("[data-fan-card]"));
        const featured = fan.querySelector<HTMLElement>("[data-featured]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: fan, start: "top 82%", once: true } });
        tl.from(cards, {
          y: desktop ? 100 : 60, rotateX: 24, rotateY: (i: number) => (desktop ? (i - 1) * -16 : 0), opacity: 0,
          transformPerspective: 1400, transformOrigin: "50% 100%", duration: 1.1, ease: "power3.out", stagger: 0.12,
        });
        if (featured && desktop) tl.to(featured, { y: -14, scale: 1.03, duration: 0.7, ease: "power2.out" }, "-=0.35");
      });

      return () => cleanups.forEach((fn) => fn());
    });

    // Images and fonts change the page height after load; re-measure every trigger.
    // In production the page has often finished loading before this effect runs, so a "load"
    // listener alone never fires; refresh now as well, and once more after layout settles.
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") requestAnimationFrame(refresh);
    else window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    const settle = window.setTimeout(refresh, 1200);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(settle);
      mm.revert();
      root.classList.remove("ll-motion");
    };
  }, []);

  return null;
}
