import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { runQa } from "../lib/qa";

const db = new PrismaClient();

async function main() {
  const email = "demo@leadloom.dev";
  await db.user.deleteMany({ where: { email } });
  await db.workspace.deleteMany({ where: { name: "Demo Agency" } });

  const user = await db.user.create({
    data: {
      email, name: "Demo User", passwordHash: await bcrypt.hash("demo1234", 10),
      memberships: { create: { role: "owner", workspace: { create: { name: "Demo Agency", plan: "agency", agencyName: "Northstar Content Co." } } } },
    },
    include: { memberships: true },
  });
  const workspaceId = user.memberships[0].workspaceId;

  const brand = await db.brand.create({
    data: {
      workspaceId, name: "BrightBooks", website: "https://brightbooks.example", industry: "Bookkeeping for e-commerce",
      audience: "Shopify and Amazon store owners doing $20k-$300k/month who do their own books in spreadsheets and dread tax season",
      offer: "Done-for-you monthly bookkeeping for e-commerce brands, from $399/month, books closed by the 10th",
      differentiators: "E-commerce only; reconciles Shopify/Amazon payouts line by line; flat pricing",
      proofPoints: "- 140+ e-commerce brands served\n- Average client finds $3,200/yr in missed deductions in the first quarter\n- \"I finally know my real margins\" — Priya, founder of Loomwear",
      voiceSamples: "We keep it simple. Your books shouldn't be a mystery.",
      voiceProfile: JSON.stringify({
        summary: "BrightBooks sounds like a calm, sharp accountant friend. Plain words, no jargon, a bit of dry humour.",
        tone: ["calm", "plain-spoken", "reassuring", "dryly funny"], pointOfView: "We / you",
        sentenceStyle: "Short sentences. Short paragraphs. Lists for steps.",
        vocabulary: ["real margins", "payouts", "no surprises", "closed by the 10th"],
        bannedWords: ["synergy", "leverage", "solutions", "best-in-class"],
        dos: ["Use real e-commerce examples", "Explain any accounting term in one line"], donts: ["Scare tactics", "Jargon"],
        sampleLines: ["Your books shouldn't be a mystery."],
      }),
    },
  });

  const funnel = await db.funnel.create({
    data: { brandId: brand.id, name: "Tax-season demand funnel", goal: "book free bookkeeping audits", strategy: "Reach store owners searching for e-commerce bookkeeping help, show them where money leaks, prove BrightBooks fixes it, and invite them to a free audit." },
  });

  const body = `# Shopify bookkeeping: the 5 mistakes that hide your real margins

If you run a Shopify store, your bank balance is lying to you. Not on purpose. Payouts bundle sales, fees and refunds into one number, so your real margins get lost.

## 1. Recording payouts as revenue
A payout is not revenue. It is revenue minus fees, refunds and chargebacks.

## 2. Ignoring payment fees
Fees add up fast. Track them as their own expense line.

## 3. Mixing personal and business cards
Keep one card for the business. Your future self will thank you.

## 4. Forgetting inventory
Cost of goods sold is the biggest number on your P&L. Count it.

## 5. Waiting until tax season
Monthly books mean no surprises in April.

Want to see where your margins are leaking? Book a free bookkeeping audit [link].`;

  const items = [
    { title: "Shopify bookkeeping: the 5 mistakes that hide your real margins", format: "blog", stage: "awareness", keyword: "shopify bookkeeping", status: "in_review", body },
    { title: "Your bank balance is lying to you", format: "linkedin_post", stage: "awareness", status: "planned" },
    { title: "How Loomwear found $3,200 in missed deductions", format: "case_study", stage: "consideration", status: "planned" },
    { title: "Free e-commerce bookkeeping audit", format: "landing_page", stage: "decision", keyword: "ecommerce bookkeeping service", status: "planned" },
    { title: "5-day 'real margins' email sequence", format: "email_sequence", stage: "decision", status: "planned" },
  ];
  for (const [i, it] of items.entries()) {
    await db.contentItem.create({
      data: {
        ...it, brandId: brand.id, funnelId: funnel.id, position: i, cta: "Book a free bookkeeping audit", angle: "Show the hidden cost of messy books.",
        version: it.body ? 1 : 0,
        qaReport: it.body ? JSON.stringify(runQa({ body: it.body, format: it.format, keyword: it.keyword })) : null,
        revisions: it.body ? { create: { version: 1, body: it.body, reason: "First draft" } } : undefined,
      },
    });
  }
  console.log(`Seeded. Log in as ${email} / demo1234. Client portal: /review/${brand.reviewToken}`);
}

main().finally(() => db.$disconnect());
