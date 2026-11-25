"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * All landing-page motion in one place, driven by data attributes in the markup:
 *   data-hero / data-hero-content  hero film recedes into a tilted window as you scroll
 *   data-split                     headline words rise out of a blur
 *   data-rise3d                    a frame that tilts back in perspective and straightens on scroll
 *   data-hover-tilt                follows the mouse in 3D (desktop, fine pointers only)
 *   data-count                     number counts up when it scrolls into view
 *   data-fan / data-fan-card       cards fan in with depth; data-featured lifts forward
 * Lenis gives the smooth scroll; ScrollTrigger reads Lenis's position every frame.
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

    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -88 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

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

      // Hero film recedes into a rounded window tilting away as you scroll past it.
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const heroContent = document.querySelector<HTMLElement>("[data-hero-content]");
      if (hero) {
        gsap.to(hero, {
          scale: desktop ? 0.86 : 0.93, rotateX: desktop ? 12 : 4, borderRadius: desktop ? 56 : 40,
          transformPerspective: 1400, transformOrigin: "50% 100%", ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
        });
      }
      if (heroContent) {
        gsap.to(heroContent, { yPercent: -14, opacity: 0, ease: "none", scrollTrigger: { trigger: hero ?? heroContent, start: "top top", end: "65% top", scrub: true } });
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
        const m = (el.textContent ?? "").match(/^(\D*)([\d.]+)(.*)$/);
        if (!m) return;
        const [, pre, num, post] = m;
        const target = Number(num);
        const decimals = (num.split(".")[1] ?? "").length;
        const state = { v: 0 };
        el.textContent = `${pre}${(0).toFixed(decimals)}${post}`;
        gsap.to(state, {
          v: target, duration: 1.6, ease: "power2.out",
          onUpdate: () => { el.textContent = `${pre}${state.v.toFixed(decimals)}${post}`; },
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
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
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      root.classList.remove("ll-motion");
    };
  }, []);

  return null;
}
