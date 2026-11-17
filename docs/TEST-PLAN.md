# Leadloom manual test plan

Run this on the live site (https://leadloom-theta.vercel.app) or locally (`npm run dev`). It takes about 20 minutes and covers every feature a paying customer uses.

**You need:** a laptop browser, a phone (or a second browser window), and two email addresses you can receive mail at (Gmail `you+test1@gmail.com` style aliases work).

> **Demo mode vs real AI.** If `ANTHROPIC_API_KEY` is not set, drafts are placeholder text marked "Demo mode". Every step below still works; only the writing quality differs. With a key set, also check the "Real AI" expectations.

---

## Demo data

Copy these values when the steps ask for them.

### Brand: GreenLeaf Lawn Care

| Field | Value |
|---|---|
| Brand name | `GreenLeaf Lawn Care` |
| Website | `https://greenleaf.example` |
| Industry | `Residential lawn care` |
| Ideal customer | `Homeowners in Denver suburbs, aged 30-55, with busy jobs and kids, who want a green, weed-free lawn but have no time to look after it and are tired of unreliable guys with a mower.` |
| Offer | `Weekly mowing, edging and seasonal fertilising from $49/visit. First visit free with a 3-month plan.` |
| What makes you different | `Same crew every week, text reminder the day before, photo of the finished lawn after every visit, pet-safe treatments.` |
| Competitors | `TruGreen, local one-man mowing services` |
| Proof points | see below |
| Voice samples | see below |

**Proof points** (paste as-is):
```
- 600+ Denver lawns looked after every week
- 4.9★ average from 380 Google reviews
- 97% of customers renew for the next season
- "They show up when they say they will, every single time." — Mark R., Highlands Ranch
```

**Voice samples** (paste all three):
```
Your weekend is for your family, not your lawn. That's the whole idea behind GreenLeaf.

We keep it simple. Same crew every week. A text the day before. A photo when we're done. If something's not right, you tell us and we fix it, no arguing.

Look, we get it. You've had the guy who shows up twice and then vanishes. We built GreenLeaf because Denver homeowners deserve better than that. Reliable isn't exciting, but it's what a great lawn is made of.

Spring tip: don't cut too short. Leave it around 3 inches. Taller grass shades out weeds and holds water better, so you'll water less and pull fewer dandelions. Simple stuff, big difference.
```

### Funnel
| Field | Value |
|---|---|
| Goal | `book 30 free first visits this spring` |
| Name | `Spring sign-up funnel` |
| Number of pieces | `6` |

### One-off request
| Field | Value |
|---|---|
| Working title | `Is your lawn ready for summer? A 5-minute checklist` |
| Format / Stage | `Blog post` / `Awareness` |
| Target keyword | `lawn care checklist denver` |
| Angle | `A quick self-check homeowners can do this weekend` |
| Call to action | `Book your free first visit` |

### Feedback texts
- **AI revision:** `Make the intro shorter, mention the photo after every visit, and end with a stronger call to action.`
- **Client change request:** `Please mention we're pet-safe near the top, a lot of our customers have dogs.`

---

## Test cases

Mark each one ✅ or ❌. If anything fails, note the step and what you saw.

### A. Sign up and setup

| # | Steps | Expected result |
|---|---|---|
| A1 | Open the site. Click **Start free**. Fill in name, company `GreenLeaf Test Agency`, email 1, password `testpass123`. Click **Create account**. | You land on the dashboard with "Welcome". Signup page showed the Terms/Privacy notice. Sidebar shows **Free trial · 0/5 pieces**. |
| A2 | Click **Add a brand**. Fill in all GreenLeaf demo data. Click **Create brand**. | Brand page opens. **Voice profile** shows a summary, tone tags, Do/Don't lists and "Never says". *Real AI:* sample lines are quoted from your voice samples. |
| A3 | Click **Copy client review link**. | Button says "Copied". |

### B. Funnel planning and drafting

| # | Steps | Expected result |
|---|---|---|
| B1 | In **Plan a new funnel**, enter the funnel demo data. Click **Plan funnel** (can take up to a minute with real AI). | Funnel page with a **Strategy** box and 6 cards across Awareness, Consideration and Decision. Each card has a format, and most have a keyword and a "→" call to action naming the next step. |
| B2 | Click **Draft all 6 remaining pieces**. | **Refused:** "The free trial includes 5 drafts (5 left)…". Nothing is drafted and the sidebar still shows 0/5. (The trial allows 5, so asking for 6 at once must be blocked before any AI work starts.) |
| B3 | Open the last card (an email sequence or landing page), scroll down and click **Delete this piece**. Back on the funnel, click **Draft all 5 remaining pieces**. Stay on the page. | Blue banner "Writing 5 pieces in the background"; cards show "Writing…". **Without refreshing**, cards turn into **Draft** one by one and the button changes to "All pieces drafted". Sidebar shows **5/5 pieces**. |

### C. Editing, quality check and revisions

| # | Steps | Expected result |
|---|---|---|
| C1 | Open the first blog post. | **Quality check** card with a score 0–100 and 10 checks (✅/⚠️/❌). **Brief** card shows keyword, angle, CTA and funnel goal. *Real AI:* reads like GreenLeaf (short sentences, "same crew", no "game-changer"), uses only the proof points given, and any missing number appears as `[ADD METRIC: …]`. |
| C2 | Click **Edit Markdown**. Add a sentence containing `synergy` and `this boosted results by 45%`. Click **Save new version**. | Version goes up by 1. QA now shows ❌ **Brand banned words: synergy** *(only if the voice profile lists it)* and ⚠️ **Unsourced statistics: 45%**. |
| C3 | In **Version history**, click **Restore** on the previous version. | Your edit disappears, a new version is created ("Restored vN"), and the QA score goes back up. |
| C4 | In **Revise with AI**, paste the AI revision feedback. Click **Revise**. | Banner "The AI is revising this piece". Within about a minute the page updates by itself with a new version. *Real AI:* shorter intro, mentions the photo, stronger CTA, everything else unchanged. Comments show "AI revision requested". |
| C5 | Click **Download .md**. | A `.md` file downloads with the piece's content. |

### D. Client review (use your phone or a private window)

| # | Steps | Expected result |
|---|---|---|
| D1 | On the blog post, click **Send to client for review**. | Status **In review**; comment "Sent for client review". |
| D2 | On your phone, open the review link from A3. | "Content review for GreenLeaf Lawn Care", the post rendered nicely, no login needed. Footer "Delivered by GreenLeaf Test Agency · Powered by Leadloom". |
| D3 | Enter name `Mark (client)` and the client change request text. Tap **Request changes**. | "Feedback sent. We'll revise it." stays on screen. |
| D4 | Back on the laptop, open the post. | Status **Changes requested**; the client's comment is highlighted in yellow. *With email configured:* email 1 received "Mark (client) requested changes to …". |
| D5 | Use **Revise with AI** with the client's text, then **Re-send for review**. On the phone, reload the link and tap **Approve**. | Phone shows "Approved — thank you!". Laptop shows **Approved**, then click **Mark delivered** → **Delivered**. |
| D6 | Open **Content board**. | Pieces sit in the right columns (Draft, Approved, Delivered…). |

### E. Limits and security

| # | Steps | Expected result |
|---|---|---|
| E1 | With 5 trial drafts used, create the one-off request (demo data) and click **Generate draft**. | Error: "The free trial includes 5 drafts (0 left). Choose a plan…". No draft is written. |
| E2 | Log out. On the login page enter email 1 with a wrong password 11 times. | From about the 11th attempt: "Too many login attempts. Wait 15 minutes…". |
| E3 | While logged out, open `/app` directly. | Redirected to the login page. |
| E4 | Open `/api/health`. | `{"ok":true, ...}` with `ai`, `billing`, `email` true/false matching your setup. |

### F. Team and account

| # | Steps | Expected result |
|---|---|---|
| F1 | Log in. **Settings → Team**: invite email 2. | "Invite emailed…" (or a copyable link if email isn't set up). "2 of 2 seats used". |
| F2 | Try inviting a third address. | Error: plan includes 2 seats. |
| F3 | In a private window, open the invite link. Enter a name and password. | You land in the same workspace and can see GreenLeaf. In **Settings** there's no Delete or Invite section (editor role). Opening the invite link again says "Invite not valid". |
| F4 | Private window: log out, **Forgot your password?**, enter email 1. | Same message whatever email you type. *With email configured:* reset email arrives; the link lets you set a new password and signs you in. Your **original** window is now signed out (refresh `/app`). |
| F5 | **Settings → Password**: change it. | "Password changed. Other devices have been signed out." |
| F6 | **Settings → Team**: **Remove** the teammate. | The teammate's window loses access on refresh. |
| F7 | **Settings → Delete workspace**: type the workspace name, confirm. | Back on the home page. Logging in with email 1 now fails. Everything from this test is gone. |

### G. Public pages

| # | Steps | Expected result |
|---|---|---|
| G1 | Open `/terms` and `/privacy`. | Both load; contact line shows `SUPPORT_EMAIL` if set. |
| G2 | Paste the site URL into a Slack or WhatsApp message (don't send). | Link preview shows the Leadloom title, description and a screenshot image. |
| G3 | Open the site on your phone. | Landing page, signup and app pages fit the screen with no sideways scrolling. |

---

## Local demo account

For a ready-made workspace with a full funnel, comments and mixed statuses, run locally:

```bash
npm run db:seed
```

Then log in as `demo@leadloom.dev` / `demo1234` (agency "Northstar Content Co.", brands BrightBooks and Sunnyside Family Dental). Don't run the seed against production.

## Automated checks

```bash
npm test          # QA engine unit tests
npm run build     # type-checks the whole app
```
