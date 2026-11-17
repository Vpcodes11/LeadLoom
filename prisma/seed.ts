import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { runQa } from "../lib/qa";

const db = new PrismaClient();
const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 86_400_000 - h * 3_600_000);

const BLOG = `# Shopify bookkeeping: 5 mistakes that hide your real margins

If you run a Shopify store, your bank balance is lying to you. Not on purpose. Shopify payouts bundle sales, fees, refunds and chargebacks into one number, so the money that lands in your account tells you almost nothing about what you actually earned.

Here are the five mistakes we see most often when a new store owner sends us their books, and how to fix each one this week.

## 1. Recording payouts as revenue

A payout is not revenue. It is revenue minus payment fees, minus refunds, minus chargebacks, sometimes minus a reserve. When you book the payout as sales, every one of those costs disappears.

**Fix it:** record gross sales from your Shopify sales report, then record fees and refunds as their own lines. The payout becomes a transfer, not income.

## 2. Treating payment fees as a rounding error

Fees feel small on each order. Across a month they rarely are. On a $60,000 month, card and app fees can easily run into the thousands.

**Fix it:** give fees their own expense account. Review it monthly. If it creeps up, check which apps are charging you per order.

## 3. Mixing personal and business spending

One card for everything makes April miserable. You'll spend hours guessing which coffee was a client meeting and which was Saturday.

**Fix it:** open a business-only card today. Move every subscription to it over the next billing cycle.

## 4. Forgetting about inventory

Cost of goods sold is usually the biggest number on an e-commerce P&L. If you expense inventory when you buy it instead of when you sell it, your margins swing wildly from month to month.

**Fix it:** track inventory as an asset and move it to cost of goods sold as units sell. Your monthly margins will finally make sense.

## 5. Waiting until tax season

Catching up on twelve months of books in March is expensive, stressful and error-prone. Monthly books mean no surprises.

**Fix it:** close your books every month. Ours are closed by the 10th, so you always know last month's real margins.

## Find out where your margins are leaking

We'll review one month of your Shopify books for free and show you exactly where money is slipping through. No pitch deck, no pressure.

**[Button: Book a free bookkeeping audit]**
`;

const LINKEDIN = `Your bank balance is lying to you.

Not on purpose.

Shopify payouts mix sales, fees, refunds and chargebacks into one number.

So a "good" payout week can still be a losing week.

Three numbers we check first for every new client:
→ Gross sales (not payouts)
→ Total payment and app fees
→ Refunds as a % of sales

If you don't know those three for last month, your margins are a guess.

What's the first number you look at each month?

#ecommerce #shopify #bookkeeping`;

const CASE = `# How Loomwear found $3,200 in missed deductions in one quarter

**Snapshot**
- **Client:** Loomwear, sustainable knitwear on Shopify
- **Challenge:** books done in spreadsheets, no idea of true margins
- **Result:** $3,200 in missed deductions found in the first quarter

## The challenge

Priya started Loomwear from her spare room. Two years later it was doing healthy monthly sales, and the books were still a spreadsheet she updated "when there was time." There rarely was.

"I knew roughly what came in. I had no idea what we actually kept."

## Why they chose BrightBooks

Priya wanted someone who understood Shopify payouts, not a generalist who would ask her to export everything by hand.

## What we did

1. Rebuilt 12 months of books from Shopify and bank data
2. Split payouts into sales, fees and refunds
3. Set up inventory tracking so cost of goods sold matched actual sales
4. Moved Loomwear to a monthly close, done by the 10th

## The results

- $3,200 in deductions that had been missed
- Monthly margin reports Priya actually reads
- [ADD METRIC: hours saved per month]

> "I finally know my real margins." — Priya, founder of Loomwear

Want the same clarity for your store? **Book a free bookkeeping audit.**
`;

const LANDING = `# Know your real margins. Every month.

Done-for-you bookkeeping for Shopify and Amazon stores. Books closed by the 10th, from $399/month.

**[Button: Book a free bookkeeping audit]**

## Sound familiar?

- You check your bank balance to guess how the month went
- Tax season means a week of digging through receipts
- You're not sure which products actually make money

## How BrightBooks fixes it

We reconcile every Shopify and Amazon payout line by line, so sales, fees and refunds are never mixed again. You get a clear P&L every month, written in plain English.

## Proof

- 140+ e-commerce brands served
- Our average client finds $3,200 a year in missed deductions in their first quarter
- "I finally know my real margins." — Priya, founder of Loomwear

## How it works

1. **Free audit.** We review one month of your books.
2. **Clean-up.** We fix the past and set up your accounts properly.
3. **Monthly close.** Books closed by the 10th, every month.

## Questions

**Do you work with Amazon too?** Yes, Shopify and Amazon, including multi-channel stores.

**Is pricing really flat?** Yes. From $399/month, no hourly billing.

**What if I'm behind by a year?** That's common. We'll catch you up first.

**[Button: Book my free audit]**
`;

const EMAILS = `## Email 1 — send on day 0
**Subject:** The number your bank won't show you
**Preview:** Your payouts aren't your sales. Here's the difference.

Hi {first_name},

Quick one. When Shopify pays you, that payout has already had fees, refunds and chargebacks taken out. So "we got $14k this week" doesn't mean you sold $14k, or kept it.

This week, pull your gross sales report and put it next to your payouts. The gap is where your margins hide.

Want us to do it for you? Book a free bookkeeping audit [link]

— The BrightBooks team

## Email 2 — send on day 2
**Subject:** Why Priya stopped dreading April
**Preview:** A knitwear brand, a messy spreadsheet, and a better way.

Hi {first_name},

Priya runs Loomwear. For two years her books were a spreadsheet she updated "when there was time." There rarely was.

We rebuilt a year of her books and found $3,200 in missed deductions in the first quarter. Now her books close by the 10th, every month.

Read the full story or book a free bookkeeping audit [link]

## Email 3 — send on day 4
**Subject:** "I can do my own books"
**Preview:** You can. Here's what it really costs.

Hi {first_name},

You can do your own books. Most of our clients did, for years. The cost isn't the software. It's the Sunday afternoons, the missed deductions, and not knowing your real margins until it's too late to act.

If that sounds familiar, book a free bookkeeping audit [link]

## Email 4 — send on day 6
**Subject:** $3,200 in one quarter
**Preview:** What our clients usually find in their first three months.

Hi {first_name},

Across 140+ e-commerce brands, the same things come up: fees booked as sales, inventory expensed too early, subscriptions nobody uses.

Our average client finds $3,200 a year in missed deductions in their first quarter with us.

Find yours: book a free bookkeeping audit [link]

## Email 5 — send on day 8
**Subject:** Your free audit is still open
**Preview:** One month of books, reviewed for free.

Hi {first_name},

Last note from us on this. We'll review one month of your books for free and show you exactly where margin is slipping. No pitch deck, no pressure.

Book a free bookkeeping audit [link]

— The BrightBooks team
`;

async function main() {
  const email = "demo@leadloom.dev";
  await db.user.deleteMany({ where: { email } });
  await db.workspace.deleteMany({ where: { name: "Northstar Content Co." } });

  const user = await db.user.create({
    data: {
      email, name: "Maya Collins", passwordHash: await bcrypt.hash("demo1234", 10),
      memberships: { create: { role: "owner", workspace: { create: { name: "Northstar Content Co.", plan: "agency", subscriptionStatus: "active", agencyName: "Northstar Content Co." } } } },
    },
    include: { memberships: true },
  });
  const workspaceId = user.memberships[0].workspaceId;

  const voice = {
    summary: "BrightBooks sounds like a calm, sharp accountant friend. Plain words, short sentences, a little dry humour, never preachy.",
    tone: ["calm", "plain-spoken", "reassuring", "dryly funny"],
    pointOfView: "We / you",
    sentenceStyle: "Short sentences, 1-3 sentence paragraphs, lists for steps, one bold 'Fix it' line per problem.",
    vocabulary: ["real margins", "payouts", "no surprises", "closed by the 10th", "plain English"],
    bannedWords: ["synergy", "leverage", "solutions", "best-in-class", "game-changer"],
    dos: ["Use real e-commerce examples", "Explain any accounting term in one line", "End with one clear next step"],
    donts: ["Scare tactics about the tax office", "Jargon", "Long intros"],
    sampleLines: ["Your books shouldn't be a mystery.", "No pitch deck, no pressure.", "Monthly books mean no surprises."],
  };

  const brand = await db.brand.create({
    data: {
      workspaceId, name: "BrightBooks", website: "https://brightbooks.example", industry: "Bookkeeping for e-commerce",
      audience: "Shopify and Amazon store owners doing $20k-$300k/month who do their own books in spreadsheets and dread tax season",
      offer: "Done-for-you monthly bookkeeping for e-commerce brands, from $399/month, books closed by the 10th",
      differentiators: "E-commerce only; reconciles Shopify/Amazon payouts line by line; flat pricing",
      proofPoints: "- 140+ e-commerce brands served\n- Average client finds $3,200/yr in missed deductions in the first quarter\n- \"I finally know my real margins\" — Priya, founder of Loomwear",
      competitors: "Bench, Pilot, local generalist accountants",
      voiceSamples: "Your books shouldn't be a mystery. We keep it simple.",
      voiceProfile: JSON.stringify(voice),
      createdAt: daysAgo(20),
    },
  });

  const funnel = await db.funnel.create({
    data: {
      brandId: brand.id, name: "Tax-season demand funnel", goal: "book 20 free bookkeeping audits a month", createdAt: daysAgo(14),
      strategy: "Reach Shopify and Amazon owners searching for bookkeeping help before tax season. Awareness content names the margin leaks they already feel; consideration content proves BrightBooks fixes them with a real client story; the decision stage turns readers into audit bookings with a focused landing page and a 5-email sequence.",
    },
  });

  const items: { title: string; format: string; stage: string; keyword?: string; status: string; body?: string; cta: string; angle: string; comments?: [string, boolean, string, string][] }[] = [
    { title: "Shopify bookkeeping: 5 mistakes that hide your real margins", format: "blog", stage: "awareness", keyword: "shopify bookkeeping", status: "approved", body: BLOG, cta: "Book a free bookkeeping audit", angle: "Payouts hide fees and refunds; show the 5 fixes.", comments: [["Priya (BrightBooks)", true, "approval", "Love this. The payouts section is exactly what our clients get wrong."]] },
    { title: "Your bank balance is lying to you", format: "linkedin_post", stage: "awareness", status: "delivered", body: LINKEDIN, cta: "Read the Shopify bookkeeping guide", angle: "Contrarian hook about payouts vs sales." },
    { title: "Amazon seller fees explained in plain English", format: "blog", stage: "awareness", keyword: "amazon seller fees explained", status: "planned", cta: "Book a free bookkeeping audit", angle: "Demystify referral, FBA and storage fees." },
    { title: "How Loomwear found $3,200 in missed deductions in one quarter", format: "case_study", stage: "consideration", status: "in_review", body: CASE, cta: "Book a free bookkeeping audit", angle: "Before/after story with real numbers." },
    { title: "The monthly close: what it is and why it saves you money", format: "newsletter", stage: "consideration", status: "draft", body: "**Subject:** The 10th of every month\n**Preview:** Why we close books on a schedule\n\n# The monthly close\n\nMost store owners do their books when they have to. We do them on the 10th. Here's why that matters, and what you get from it.\n\n## What a close actually is\n\nA close means every payout, fee, refund and expense from last month is matched and checked. Nothing left in a pile.\n\n## Why it saves you money\n\nYou spot problems while they're small: a duplicate app charge, a spike in refunds, a supplier price change.\n\nWant your books closed on the 10th? Book a free bookkeeping audit [link].", cta: "See the Loomwear case study", angle: "Explain the monthly close in plain English." },
    { title: "Free e-commerce bookkeeping audit", format: "landing_page", stage: "decision", keyword: "ecommerce bookkeeping service", status: "changes_requested", body: LANDING, cta: "Book my free audit", angle: "Make the audit irresistible and risk-free.", comments: [["Priya (BrightBooks)", true, "change_request", "Can we add that we also handle sales tax filings? And make the hero mention Amazon too."]] },
    { title: "5-day 'real margins' welcome sequence", format: "email_sequence", stage: "decision", status: "draft", body: EMAILS, cta: "Book a free bookkeeping audit", angle: "Turn subscribers into audit bookings." },
  ];

  for (const [i, it] of items.entries()) {
    const created = await db.contentItem.create({
      data: {
        brandId: brand.id, funnelId: funnel.id, position: i, title: it.title, format: it.format, stage: it.stage,
        keyword: it.keyword ?? null, status: it.status, body: it.body ?? null, cta: it.cta, angle: it.angle,
        version: it.body ? 2 : 0,
        qaReport: it.body ? JSON.stringify(runQa({ body: it.body, format: it.format, keyword: it.keyword, cta: it.cta, bannedWords: voice.bannedWords })) : null,
        revisions: it.body ? { create: [{ version: 1, body: it.body, reason: "First draft", createdAt: daysAgo(6) }, { version: 2, body: it.body, reason: "Tightened intro, added CTA", createdAt: daysAgo(3) }] } : undefined,
        createdAt: daysAgo(14 - i),
      },
    });
    for (const [author, fromClient, kind, body] of it.comments ?? []) {
      await db.comment.create({ data: { itemId: created.id, author, fromClient, kind, body, createdAt: daysAgo(1, 3) } });
    }
    if (it.body) await db.usageEvent.create({ data: { workspaceId, kind: "draft" } });
  }

  const dental = await db.brand.create({
    data: {
      workspaceId, name: "Sunnyside Family Dental", website: "https://sunnyside.example", industry: "Family dentistry",
      audience: "Busy parents in Austin who need a family dentist open on Saturdays", offer: "New-patient exam and cleaning for $99, Saturday appointments",
      voiceProfile: JSON.stringify({ ...voice, summary: "Warm, upbeat and reassuring. Speaks to busy parents like a friendly neighbour.", tone: ["warm", "upbeat", "reassuring"], bannedWords: ["painless", "state-of-the-art"] }),
      createdAt: daysAgo(10),
    },
  });
  const dentalFunnel = await db.funnel.create({ data: { brandId: dental.id, name: "New patient funnel", goal: "book new-patient exams", strategy: "Local search content for parents, a Saturday-hours landing page and a reminder sequence." } });
  for (const [i, t] of ["Saturday dentist in Austin: what parents should know", "How to prepare your kid for their first dental visit", "$99 new-patient exam (Saturdays available)"].entries()) {
    await db.contentItem.create({ data: { brandId: dental.id, funnelId: dentalFunnel.id, position: i, title: t, format: i === 2 ? "landing_page" : "blog", stage: i === 2 ? "decision" : "awareness", status: i === 0 ? "draft" : "planned", body: i === 0 ? "# Saturday dentist in Austin\n\nDraft in progress." : null, version: i === 0 ? 1 : 0 } });
  }

  console.log(`Seeded. Log in as ${email} / demo1234. Client portal: /review/${brand.reviewToken}`);
}

main().finally(() => db.$disconnect());
