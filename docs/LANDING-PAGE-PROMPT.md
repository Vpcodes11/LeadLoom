# Prompt for ChatGPT: Leadloom immersive landing page

Copy everything below the line into ChatGPT. Attach the 7 product screenshots from `docs/screenshots/` (dashboard, brand, funnel, content-editor, board, client-portal-mobile, billing).

---

You are a senior product designer and creative front-end engineer (Three.js / WebGL, motion design, conversion copywriting). Build a world-class, immersive landing page for **Leadloom**, a B2B SaaS, and deliver it as a **zip file** that drops into an existing Next.js app.

Work in two phases. Do the research first, show me a short summary of it, then build.

## Phase 1: Research (do this before designing)

1. Study 8–10 best-in-class SaaS and AI-product landing pages known for immersive hero sections and motion (for example Linear, Vercel, Stripe, Framer, Raycast, Arc, Rive, Spline-based sites, and current Awwwards "Site of the Day" SaaS winners). For each, note in one line what makes the hero, scroll storytelling and product reveal work. Take patterns and principles only. Do not copy any layout, artwork, copy or brand.
2. Research what converts for B2B tools sold to **marketing and SEO agency owners**: proof without fake testimonials, pricing clarity, objection handling, CTA placement.
3. Research performance rules for WebGL and video heroes on mobile: lazy loading, poster fallbacks, `prefers-reduced-motion`, low-power devices, and keeping Largest Contentful Paint under 2.5 s.
4. Pick ONE hero concept and justify it in 3–4 sentences:
   - **Option A (preferred): real-time 3D.** A "loom" of glowing threads (React Three Fiber) that weave into a funnel shape and resolve into content cards (blog → case study → landing page → email) as the user scrolls. This directly shows what "Leadloom" means: weaving content into a funnel that leads to customers.
   - **Option B: background video.** A looping, muted, abstract video of flowing threads or light. Only if you can supply a file that is royalty-free with a clear licence (state the source and licence), or one you generate yourself. It must be ≤ 4 MB, MP4 (H.264) + WebM, with a poster image.

## Phase 2: Build

### Product facts (use only these, invent nothing)

- **Name:** Leadloom (capital L, rest lowercase). **Tagline:** "Content funnels that turn interest into customers."
- **Audience:** owners of marketing, SEO and web agencies (5–20 people) who sell content to clients; also small and midsize businesses.
- **What it does:**
  1. **Learns each client's voice.** Paste a few things the brand wrote, and it builds a voice profile: tone, words they use, words they'd never use, do's and don'ts, sample lines.
  2. **Plans content funnels.** Give it a business goal (for example "book 30 consultations this quarter"). It maps a connected funnel across awareness → consideration → decision. Each piece has a format, keyword, angle and a call to action pointing to the next piece.
  3. **Writes drafts in 6 formats:** blog posts, landing pages, 5-email sequences, case studies, LinkedIn posts, newsletters. It only uses the brand's real proof points. Missing numbers become placeholders like `[ADD METRIC: hours saved]` instead of made-up stats.
  4. **Checks quality automatically (score 0–100).** 10 checks: length, readability, long sentences, AI-sounding phrases ("delve", "game-changer"…), brand banned words, unsourced statistics, target keyword, structure, call to action, unfilled placeholders.
  5. **Revisions with version history.** Edit directly or ask the AI to revise with feedback. Restore any version.
  6. **Client review portal, no login.** Clients open a private link on any device and tap Approve or Request changes. White-label on the Agency plan.
  7. **Production board:** Requested → Planned → Draft → In review → Changes requested → Approved → Delivered.
  8. **Delivery:** copy or download Markdown for WordPress, Webflow, Ghost, Notion and Google Docs.
  9. **Teams:** invite teammates, owner and editor roles, Google sign-in.
- **Pricing (monthly, USD; import from code, see below):** Free trial: 5 pieces one-time, 1 brand, 2 seats, no card. Starter $49: 12 pieces/mo, 1 brand, 2 seats. Growth $149: 40 pieces/mo, 5 brands, 5 seats. Agency $399: 150 pieces/mo, 50 brands, 15 seats, white-label portal. Cancel anytime. **7-day money-back guarantee on the first payment.** Local taxes may apply at checkout.
- **Comparison:** content agency $1,000+/mo per client vs generic AI writer $20–100 (no strategy, voice, QA or client workflow) vs Leadloom $49–399.
- **Retainer math (true, keep it):** Agency plan $399 ÷ 150 pieces ≈ $2.66 per piece; two $500 client content retainers cover it.
- **FAQ (keep the substance, you may tighten the wording):** "Is this just ChatGPT with a nicer screen?" / "Will my clients know I use AI?" (only if you tell them; white-label portal) / "Does it make up facts?" (only uses your proof points; [ADD METRIC] placeholders) / "Do I still need to edit?" (yes; it does the first-draft work) / "What happens after the free trial?" (keep everything; pick a plan; cancel anytime) / add "What's your refund policy?" (7-day money-back on the first payment).

**Hard rules for honesty:** no fake testimonials, customer logos, user counts, ratings, "trusted by" bars or invented statistics. The product is new. Use the real screenshots and the true facts above as proof. A "Built for agencies" or "Founding customer" angle is fine.

### Page structure (adapt if your research suggests better, and say why)

1. Sticky glass nav: logo, Features, How it works, Pricing, FAQ, Log in, **Start free** (primary).
2. **Hero:** the immersive 3D or video background, headline, subhead, primary CTA "Start free: 5 pieces, no card" → `/signup`, secondary CTA "See how it works" → `#how`, small trust line "No card needed · Cancel anytime · 7-day money-back".
3. Product reveal: the dashboard or funnel screenshot in a perspective/tilted device frame that straightens on scroll.
4. Problem section (freelancers miss deadlines, drafts don't sound like the client, feedback everywhere, content is the worst-margin service).
5. **How it works:** a scroll-driven story through voice → funnel plan → draft → quality check → client approval → delivery, each step with its real screenshot.
6. Feature deep-dives: an animated quality-score meter (counts up to 90 with checks ticking ✅/⚠️), a funnel map animation, and the client portal on a phone mockup.
7. Comparison table (agency vs generic AI vs Leadloom).
8. Retainer math band.
9. Pricing cards (Starter, Growth, Agency highlighted as "Best for agencies") plus the free-trial note and money-back line.
10. FAQ accordion.
11. Final CTA with a subtle replay of the hero motif.
12. Footer: © year Leadloom · Terms (`/terms`) · Privacy (`/privacy`) · Refunds (`/refund-policy`).

### Visual direction

- Premium, dark-first hero (deep navy/ink) that transitions to a light page below, or a fully dark page if your research supports it. Keep text contrast WCAG AA.
- Brand colours (keep these): `brand-50 #eef6ff`, `brand-100 #d9eaff`, `brand-500 #2f6bff`, `brand-600 #1f55e6`, `brand-700 #1a45b8`. You may add an accent gradient (for example electric blue → violet) and glow effects.
- Typography: one modern sans from `next/font/google` (for example Inter, Geist or Manrope). Large, tight-tracked headlines.
- Motion: smooth and purposeful, not gimmicky. Scroll-linked reveals, subtle parallax, magnetic primary button, hover tilt on cards.

### Technical requirements (must match the existing app exactly)

- **Stack:** Next.js **15** App Router, React **19**, TypeScript strict, **Tailwind CSS v4** (CSS-first config with `@theme` in `app/globals.css`; there is NO `tailwind.config.js`). The brand colours above already exist as Tailwind classes: `bg-brand-600`, `text-brand-500` and so on.
- **Allowed new dependencies only:** `three`, `@react-three/fiber` (v9, React 19 compatible), `@react-three/drei`, `motion` (Framer Motion; import from `motion/react`). Pin exact versions that are compatible with React 19 and Next 15, and list them in `DEPENDENCIES.md`. No other UI libraries, no GSAP Club plugins, no paid assets.
- **3D/video loading:** the 3D canvas must be a client component loaded with `next/dynamic` and `{ ssr: false }`, starting after first paint. Show a static gradient or poster image immediately. Pause rendering when off-screen (IntersectionObserver) or when the tab is hidden. Cap device pixel ratio at 1.5. Use a lighter scene or the poster on mobile and low-power devices.
- **Accessibility:** respect `prefers-reduced-motion` (no 3D animation, no parallax; show the static poster), semantic headings (one `h1`), keyboard-accessible FAQ, visible focus rings, alt text on every image.
- **Server and client split:** `app/page.tsx` stays a **Server Component** and exports `metadata`. Interactive parts go in client components marked with `"use client"`.
- **Pricing data:** import plans from the existing module so prices never drift:
  ```ts
  import { PLANS, type PlanId } from "@/lib/plans";
  // PLANS: Record<"trial"|"starter"|"growth"|"agency", { name: string; price: number; brands: number; piecesPerMonth: number; seats: number; whiteLabel: boolean; blurb: string }>
  ```
- **Screenshots** already exist in the app at these public paths. Use them with `next/image` and these exact sizes:
  - `/product/dashboard.png`, `/product/brand.png`, `/product/funnel.png`, `/product/content-editor.png`, `/product/board.png`, `/product/billing.png` (2880×1800)
  - `/product/client-portal-mobile.png` (1170×2532)
- **Links and routes** (do not change): `/signup`, `/login`, `#how`, `#pricing`, `#faq`, `/terms`, `/privacy`, `/refund-policy`.
- Do not modify anything outside the files listed below. No API routes, no changes to `app/layout.tsx`, auth or billing.
- Performance targets on mobile Lighthouse: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100. Hero JavaScript (3D) under about 250 KB gzipped, lazy-loaded.
- Code quality: TypeScript with no `any`, no console logs, components under about 200 lines each, comments only where the reason isn't obvious.

### Deliverable: one zip with exactly this layout

```
leadloom-landing.zip
├─ app/page.tsx                  (replaces the existing landing page; Server Component; exports metadata)
├─ components/landing/*.tsx      (all landing components, including the 3D scene)
├─ public/landing/*              (poster images, optional video files, textures; total ≤ 6 MB)
├─ app/landing.css               (optional; extra CSS imported by app/page.tsx; no global resets)
├─ DEPENDENCIES.md               (npm install line with exact versions)
└─ NOTES.md                      (hero concept, research summary, sources and licences for any media, known limitations)
```

Before you zip it, check: every import resolves to a file in the zip, an allowed dependency, `next/*`, `react`, or `@/lib/plans`; no file outside the layout above; the page renders with JavaScript disabled (static content and poster visible); and reduced-motion mode works.

Start with Phase 1 and show me the research summary and the chosen hero concept. Then build and give me the zip.
