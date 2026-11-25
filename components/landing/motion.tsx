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

    // Anchor links glide; the sections' own scroll-margin (scroll-mt-24) leaves room for the floating nav.
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
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

      // Hero film recedes into a window tilting away as you scroll past it.
      // Transform and opacity only: both run on the GPU compositor without repainting the film.
      // (Animating border-radius repainted the whole video layer every frame and made it stutter.)
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const heroContent = document.querySelector<HTMLElement>("[data-hero-content]");
      if (hero) {
        // While the hero is moving, hold the film on its current frame: decoding 1080p video and
        // compositing it through a 3D transform every frame is what stutters on laptop GPUs.
        // It resumes when you scroll back to the top.
        // The <video> mounts a moment after this runs, so look it up when needed. The flag tells
        // BgVideo not to restart it (e.g. on a tab switch) while it is frozen.
        let frozen = false;
        const freeze = (on: boolean) => {
          if (on === frozen) return;
          frozen = on;
          hero.dataset.frozen = on ? "1" : "";
          const film = hero.querySelector("video");
          if (!film) return;
          if (on) film.pause();
          else if (!document.hidden) void film.play().catch(() => {});
        };
        gsap.to(hero, {
          scale: desktop ? 0.88 : 0.94, rotateX: desktop ? 8 : 3, force3D: true,
          transformPerspective: 1600, transformOrigin: "50% 100%", ease: "none",
          scrollTrigger: {
            trigger: hero, start: "top top", end: "bottom top", scrub: true,
            onUpdate: (self) => freeze(self.progress > 0.02),
            onLeaveBack: () => freeze(false),
          },
        });
      }
      if (heroContent) {
        gsap.to(heroContent, { yPercent: -14, opacity: 0, force3D: true, ease: "none", scrollTrigger: { trigger: hero ?? heroContent, start: "top top", end: "65% top", scrub: true } });
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
      gsap.ticker.remove(tick);
      lenis.destroy();
      root.classList.remove("ll-motion");
    };
  }, []);

  return null;
}
