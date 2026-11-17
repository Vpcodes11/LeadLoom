# Leadloom

AI content-funnel platform: plan and produce connected blogs, landing pages, email sequences, case studies and social posts in each brand's voice, with quality checks, revisions, a client review portal and delivery.

## Run it locally

Needs Node 20+ and Postgres (local, Docker, or a free Neon/Supabase database).

```bash
npm install
cp .env.example .env        # set DATABASE_URL, DIRECT_URL, AUTH_SECRET, CRON_SECRET (+ ANTHROPIC_API_KEY for real AI)
npx prisma migrate deploy   # create tables
npm run db:seed             # optional demo data: demo@leadloom.dev / demo1234
npm run dev                 # http://localhost:3000
```

Without `ANTHROPIC_API_KEY` the app runs in **demo mode** with placeholder AI output, so you can click through every flow.

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

Next.js 15 (App Router, server actions) · TypeScript · Tailwind v4 · Prisma + Postgres · Anthropic SDK (`claude-opus-5-5`, structured outputs, server-side refusal fallback) · Stripe.

## Deploying (Vercel + Neon)

1. Create a Postgres database on [Neon](https://neon.tech) (free tier). Copy the **pooled** connection string into `DATABASE_URL` and the **direct** one into `DIRECT_URL`.
2. Import the GitHub repo in Vercel and set the env vars from `.env.example`: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `CRON_SECRET`, `ANTHROPIC_API_KEY`, `APP_URL` (your Vercel URL).
3. Deploy. The build runs `prisma migrate deploy`, so tables are created automatically.
4. Stripe: create 3 monthly prices, set `STRIPE_SECRET_KEY` and `STRIPE_PRICE_STARTER/GROWTH/AGENCY`, add a webhook to `https://YOUR_APP/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, then set `STRIPE_WEBHOOK_SECRET`.

**How long AI work runs:** drafts and revisions are background jobs (`lib/jobs.ts`). They start right after the request returns (`after()`), up to 3 at a time, and pages auto-refresh until they finish. AI pages set `maxDuration = 300`. A cron (`vercel.json`, every 5 min) retries stuck jobs; on the Vercel Hobby plan crons run at most daily, which is fine as a safety net.

**Abuse limits:** monthly caps per AI action (drafts, revisions = 3x drafts, funnel plans, voice builds) per plan in `lib/plans.ts`; failed jobs are refunded. Signup is limited to 3 accounts per IP per day; login to 10 attempts per email and 30 per IP per 15 minutes (`lib/ratelimit.ts`).

## Roadmap (where to beat the original)

- **Background jobs + streaming** for drafting (queue such as Inngest/Trigger.dev), so "Draft all" doesn't block a request.
- **Live SEO data**: keyword volume/difficulty and SERP analysis (DataForSEO) in the planner.
- **Publishing**: WordPress/Webflow/Ghost push, Google Docs export, social scheduling.
- **Team roles**: editors/writers with assignment and due-date reminders; email notifications on client feedback.
- **Performance loop**: connect Google Search Console/Analytics, show which pieces drive leads, and refresh underperformers.
- **Human-edit add-on**: optional paid human editor pass per piece (higher price tier, like the original service).
