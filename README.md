# Leadloom

AI content-funnel platform: plan and produce connected blogs, landing pages, email sequences, case studies and social posts in each brand's voice, with quality checks, revisions, a client review portal and delivery.

## Run it locally

```bash
npm install
cp .env.example .env        # then set AUTH_SECRET (and ANTHROPIC_API_KEY for real AI output)
npx prisma db push          # creates prisma/dev.db (SQLite)
npm run db:seed             # optional demo data: demo@leadloom.dev / demo1234
npm run dev                 # http://localhost:3000
```

Without `ANTHROPIC_API_KEY` the app runs in **demo mode** with placeholder AI output, so you can click through every flow.

```bash
npm test                    # QA engine unit tests
npm run build               # production build (type-checks everything)
```

## What's in the MVP

| Area | What it does | Where |
|---|---|---|
| Accounts | Email/password signup, workspaces, signed session cookie | `lib/auth.ts`, `app/login`, `app/signup` |
| Brands | Ideal customer, offer, differentiators, proof points, competitors, voice samples | `app/app/brands` |
| Voice profile | Claude reads writing samples → tone, vocabulary, banned words, do/don't, sample lines | `lib/ai.ts → extractVoice` |
| Funnel planner | Goal → N connected pieces across awareness / consideration / decision, each with keyword, angle and a CTA pointing to the next piece | `lib/ai.ts → planFunnel`, `app/app/funnels/[id]` |
| Drafting | Writes each piece in the brand voice using a per-format structure; only cites provided proof points, uses `[ADD METRIC]` / `[SOURCE]` placeholders instead of inventing facts | `lib/ai.ts → writeDraft`, `lib/formats.ts` |
| QA engine | Deterministic checks: length, readability, long sentences, AI-sounding phrases, brand banned words, unsourced stats, keyword placement, structure, CTA, placeholders → score 0-100 | `lib/qa.ts` (+ tests) |
| Revisions | Edit Markdown, AI revise from feedback, full version history with restore | content page |
| Workflow | Requested → planned → draft → in review → changes requested → approved → delivered; kanban board | `app/app/board` |
| Client portal | No-login review link per brand; clients approve or request changes; white-label on Agency plan | `app/review/[token]` |
| Delivery | Copy Markdown, download `.md` | `app/api/export` |
| Billing | Plans with monthly piece/brand limits, Stripe Checkout, customer portal, webhook | `lib/plans.ts`, `app/api/stripe/*` |

## Stack

Next.js 15 (App Router, server actions) · TypeScript · Tailwind v4 · Prisma (SQLite in dev) · Anthropic SDK (`claude-opus-5-5`, structured outputs, server-side refusal fallback) · Stripe.

## Going to production

1. Switch `provider = "sqlite"` to `"postgresql"` in `prisma/schema.prisma` and set `DATABASE_URL` (Neon, Supabase, Railway…).
2. Set `AUTH_SECRET`, `ANTHROPIC_API_KEY`, `APP_URL`.
3. Create 3 recurring prices in Stripe; set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER/GROWTH/AGENCY`, and point a webhook at `/api/stripe/webhook` (events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) → `STRIPE_WEBHOOK_SECRET`.
4. Deploy (Vercel works out of the box). Long drafts can take 30-90s: use a plan whose function timeout allows that, or move drafting to a background job (see roadmap).

## Roadmap (where to beat the original)

- **Background jobs + streaming** for drafting (queue such as Inngest/Trigger.dev), so "Draft all" doesn't block a request.
- **Live SEO data**: keyword volume/difficulty and SERP analysis (DataForSEO) in the planner.
- **Publishing**: WordPress/Webflow/Ghost push, Google Docs export, social scheduling.
- **Team roles**: editors/writers with assignment and due-date reminders; email notifications on client feedback.
- **Performance loop**: connect Google Search Console/Analytics, show which pieces drive leads, and refresh underperformers.
- **Human-edit add-on**: optional paid human editor pass per piece (higher price tier, like the original service).
