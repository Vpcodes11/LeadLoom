import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { LinkButton, Card } from "@/components/ui";
import { PLANS, type PlanId } from "@/lib/plans";

const pains = [
  { t: "Freelancers miss deadlines", d: "And you find out the day the client expects it." },
  { t: "Drafts don't sound like the client", d: "So you rewrite them yourself at 11pm." },
  { t: "Feedback lives everywhere", d: "Email, WhatsApp, Doc comments. Which version did they approve?" },
  { t: "Content is your worst margin", d: "After writer costs and your time, there's little left." },
];

const features = [
  { n: "1", t: "Learns each client's voice once", d: "Paste a few things they've written. Leadloom builds a voice profile: their tone, the words they use and the words they'd never say. Every draft is written to it." },
  { n: "2", t: "Plans content that sells", d: "Give it the client's goal, like \"book 30 consultations this quarter\". It maps a connected funnel of blogs, case studies, a landing page and emails, each pointing to the next." },
  { n: "3", t: "Checks every draft before you do", d: "A quality score on every piece. It flags AI-sounding phrases, banned words, unsourced statistics and missing calls to action. It never invents results: missing numbers become [ADD METRIC]." },
  { n: "4", t: "Clients approve with one link", d: "No logins, no email threads. Clients read on their phone and tap Approve or Request changes. On the Agency plan, the page shows only your agency's name." },
  { n: "5", t: "One board for every client", d: "Every piece for every client: drafting, with the client, needs changes, approved, delivered." },
];

const faqs = [
  { q: "Is this just ChatGPT with a nicer screen?", a: "No. ChatGPT gives you one-off text. Leadloom keeps a voice profile and fact sheet per client, plans connected funnels, scores every draft, and handles client approval and delivery. It's the agency workflow, not a chat box." },
  { q: "Will my clients know I use AI?", a: "Only if you tell them. On the Agency plan the review portal is white-label, and you approve every piece before it goes out." },
  { q: "Does it make up facts?", a: "It is instructed to use only the proof points you give it for each client. Where a number would help but you haven't provided one, it writes a placeholder like [ADD METRIC] and the quality check flags it until it's filled in." },
  { q: "Do I still need to edit?", a: "Yes, and that's the point. Leadloom does the research-and-first-draft work that eats your week. You keep the judgment your clients pay you for." },
  { q: "What happens after the free trial?", a: "You keep everything you made. To create more, pick a plan. No contracts; cancel anytime from the Billing page." },
];

export default function Home() {
  const plans = (["starter", "growth", "agency"] as PlanId[]).map((id) => ({ id, ...PLANS[id] }));
  const agency = PLANS.agency;
  const perPiece = (agency.price / agency.piecesPerMonth).toFixed(2);
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <LinkButton href="#pricing" variant="ghost" className="hidden sm:inline-flex">Pricing</LinkButton>
          <LinkButton href="/login" variant="ghost">Log in</LinkButton>
          <LinkButton href="/signup">Start free</LinkButton>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-12 sm:pt-16 pb-12 text-center">
        <p className="mb-4 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">For marketing and SEO agencies</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">Sell content to every client without hiring a writing team</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Leadloom learns each client&apos;s voice, plans content funnels that lead to sales, writes and quality-checks every draft,
          and gets client approval with one link. You keep the judgment. It does the rest.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <LinkButton href="/signup">Try it on one client, free</LinkButton>
          <LinkButton href="#how" variant="secondary">See how it works</LinkButton>
        </div>
        <p className="mt-3 text-xs text-slate-500">5 free pieces · 2 seats · full client portal · no card needed</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-xl">
          <Image src="/product/funnel.png" alt="A client's content funnel in Leadloom, from awareness to decision" width={2880} height={1800} priority className="h-auto w-full" />
        </div>
      </section>

      {/* Problem */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl sm:text-3xl font-bold">Clients keep asking for content. You keep saying yes.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">And every month it&apos;s the same problems.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pains.map((p) => (
              <Card key={p.t}><h3 className="font-semibold">{p.t}</h3><p className="mt-2 text-sm text-slate-600">{p.d}</p></Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <h2 className="text-center text-2xl sm:text-3xl font-bold">Your whole content workflow, in one place</h2>
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            {features.map((f) => (
              <div key={f.n} className="flex gap-4">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">{f.n}</div>
                <div><h3 className="font-semibold">{f.t}</h3><p className="mt-1 text-sm text-slate-600">{f.d}</p></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-lg">
              <Image src="/product/content-editor.png" alt="Draft with a quality score of 90 and ten checks" width={2880} height={1800} className="h-auto w-full" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1/3 overflow-hidden rounded-xl border border-slate-200 shadow-lg">
                <Image src="/product/client-portal-mobile.png" alt="Client reviewing content on a phone" width={1170} height={2532} className="h-auto w-full" />
              </div>
              <p className="w-2/3 pt-4 text-sm text-slate-600"><strong className="text-slate-900">Your client&apos;s view.</strong> A private link, no account. They read it on their phone, then approve or ask for changes. Their feedback lands on your board.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Math */}
      <section className="bg-brand-600 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Two client retainers pay for it</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div><div className="text-4xl font-bold">${agency.price}</div><div className="mt-1 text-sm text-brand-100">a month on the Agency plan</div></div>
            <div><div className="text-4xl font-bold">${perPiece}</div><div className="mt-1 text-sm text-brand-100">per piece across {agency.piecesPerMonth} pieces</div></div>
            <div><div className="text-4xl font-bold">2 × $500</div><div className="mt-1 text-sm text-brand-100">client content retainers cover it, with profit left</div></div>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-sm text-brand-100">A content agency charges around $1,000 a month per client. Freelancers cost $100–300 per blog post plus your editing time. Add a third client and content becomes your best-margin service.</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <h2 className="text-center text-3xl font-bold">Simple monthly plans</h2>
        <p className="text-center text-slate-600 mt-2">Start with 5 free pieces, no card needed. No contracts, cancel anytime.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.id} className={p.id === "agency" ? "ring-2 ring-brand-500" : ""}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                {p.id === "agency" && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">For agencies</span>}
              </div>
              <p className="text-sm text-slate-500">{p.blurb}</p>
              <p className="mt-4 text-3xl font-bold">${p.price}<span className="text-base font-normal text-slate-500">/mo</span></p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                <li>✓ {p.piecesPerMonth} pieces per month</li>
                <li>✓ {p.brands} client brand{p.brands > 1 ? "s" : ""}</li>
                <li>✓ {p.seats} team seat{p.seats > 1 ? "s" : ""}</li>
                <li>✓ Voice profiles and funnel planner</li>
                <li>✓ Quality checks on every draft</li>
                <li>{p.whiteLabel ? "✓ White-label client review portal" : "✓ Client review links"}</li>
              </ul>
              <LinkButton href="/signup" className="mt-6 w-full" variant={p.id === "agency" ? "primary" : "secondary"}>Start free</LinkButton>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-2xl sm:text-3xl font-bold">Questions agencies ask</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer list-none font-medium flex items-center justify-between gap-4">{f.q}<span className="text-slate-400 group-open:rotate-45 transition">+</span></summary>
                <p className="mt-3 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Try it on your most demanding client this week</h2>
        <p className="mt-3 text-slate-600">Build their funnel, send them the review link. If they approve faster than they do now, you&apos;ll know.</p>
        <LinkButton href="/signup" className="mt-6">Start free: 5 pieces, no card</LinkButton>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Leadloom · <Link href="/terms" className="hover:underline">Terms</Link> · <Link href="/privacy" className="hover:underline">Privacy</Link> · <Link href="/refund-policy" className="hover:underline">Refunds</Link>
      </footer>
    </div>
  );
}
