import Link from "next/link";
import { Logo } from "@/components/logo";
import { LinkButton, Card } from "@/components/ui";
import { PLANS, type PlanId } from "@/lib/plans";

const steps = [
  { t: "Teach it your voice", d: "Paste a few things you've written. Leadloom builds a voice profile with your tone, words you use and words you'd never say." },
  { t: "Plan a connected funnel", d: "Tell it your goal, like booking demo calls. It maps blogs, social posts, case studies, a landing page and an email sequence that lead into each other." },
  { t: "Draft, check, revise", d: "Every draft is written in your voice and checked for length, readability, keyword use, AI-sounding phrases and made-up stats." },
  { t: "Client review and delivery", d: "Agencies share a branded review link. Clients approve or request changes without an account. Export to Markdown in one click." },
];

export default function Home() {
  const plans = (["starter", "growth", "agency"] as PlanId[]).map((id) => ({ id, ...PLANS[id] }));
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <LinkButton href="/login" variant="ghost">Log in</LinkButton>
          <LinkButton href="/signup">Start free</LinkButton>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-20 text-center">
        <p className="mb-4 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">For small businesses and the agencies that serve them</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">Content funnels that turn interest into customers</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Plan and produce blogs, landing pages, emails, case studies and social posts that work together, in your brand&apos;s voice.
          Content-agency quality for a fraction of the monthly retainer.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/signup">Build your first funnel</LinkButton>
          <LinkButton href="#pricing" variant="secondary">See pricing</LinkButton>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.t}>
              <div className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">{i + 1}</div>
              <h3 className="font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <h2 className="text-center text-3xl font-bold">Simple monthly plans</h2>
        <p className="text-center text-slate-600 mt-2">Start with 5 free pieces, no card needed. No contracts, cancel anytime.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.id} className={p.id === "growth" ? "ring-2 ring-brand-500" : ""}>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-slate-500">{p.blurb}</p>
              <p className="mt-4 text-3xl font-bold">${p.price}<span className="text-base font-normal text-slate-500">/mo</span></p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                <li>✓ {p.piecesPerMonth} pieces per month</li>
                <li>✓ {p.brands} brand{p.brands > 1 ? "s" : ""}</li>
                <li>✓ {p.seats} team seat{p.seats > 1 ? "s" : ""}</li>
                <li>✓ Voice profiles and funnel planner</li>
                <li>✓ Quality checks on every draft</li>
                <li>{p.whiteLabel ? "✓ White-label client review portal" : "✓ Client review links"}</li>
              </ul>
              <LinkButton href="/signup" className="mt-6 w-full" variant={p.id === "growth" ? "primary" : "secondary"}>Start free</LinkButton>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Leadloom · <Link href="/terms" className="hover:underline">Terms</Link> · <Link href="/privacy" className="hover:underline">Privacy</Link>
      </footer>
    </div>
  );
}
