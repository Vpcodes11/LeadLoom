import Image from "next/image";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/plans";
import { Reveal } from "./reveal";
import { Photo, PHOTOS } from "./photo";

export function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`mono text-[11px] uppercase ${light ? "text-white/60" : "text-[var(--ink-2)]"}`}>{children}</p>;
}

const PAINS = [
  ["Freelancers miss deadlines", "And you find out the morning the client expects it."],
  ["Drafts don’t sound like the client", "So you rewrite them yourself at 11pm."],
  ["Feedback lives everywhere", "Email, WhatsApp, doc comments. Which version did they approve?"],
  ["Content is your worst margin", "After writer fees and your time, there’s little left."],
];

export function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
      <Reveal>
        <Eyebrow>The problem</Eyebrow>
        <h2 className="serif mt-4 max-w-3xl text-[44px] leading-[1.02] sm:text-[64px]">Clients keep asking for content. <em className="text-[var(--ink-2)]">You keep saying yes.</em></h2>
      </Reveal>
      <div className="mt-16 grid gap-px overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
        {PAINS.map(([t, d], i) => (
          <Reveal key={t} delay={i * 90} className="bg-[var(--paper)] p-7">
            <p className="serif text-[40px] leading-none text-[var(--amber)]">0{i + 1}</p>
            <h3 className="mt-6 text-[17px] font-medium">{t}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-2)]">{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Portal() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-28 sm:px-8 lg:grid-cols-2">
      <Reveal className="order-2 lg:order-1">
        <Eyebrow>Client review portal</Eyebrow>
        <h2 className="serif mt-4 text-[42px] leading-[1.04] sm:text-[56px]">Approval in one tap, <em>on their phone.</em></h2>
        <p className="mt-5 max-w-md text-[15px] leading-7 text-[var(--ink-2)]">Each client gets a private link. No account, no password. They read the piece, then tap Approve or Request changes, and their comment lands on your board. On the Agency plan it shows only your agency’s name.</p>
        <ul className="mono mt-8 space-y-2 text-[12px] uppercase text-[var(--ink-2)]">
          <li>— No logins for clients</li><li>— Comments land on the right piece</li><li>— White-label on Agency</li>
        </ul>
      </Reveal>
      <Reveal className="order-1 flex justify-center lg:order-2" delay={120}>
        <div className="relative w-[260px] rounded-[44px] bg-[#1f1c19] p-2.5 shadow-[0_50px_90px_-40px_rgba(28,26,23,.6)] sm:w-[300px]">
          <div className="overflow-hidden rounded-[36px] bg-white">
            <Image src="/product/client-portal-mobile.png" alt="A client reviewing a draft on a phone, with Approve and Request changes buttons" width={1170} height={2532} sizes="300px" className="h-auto w-full" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const ROWS: [string, string, string, string][] = [
  ["Learns each brand’s voice", "Yes", "No", "Yes"],
  ["Plans a connected funnel", "Yes", "No", "Yes"],
  ["Uses only real facts", "Yes", "No", "Yes"],
  ["Quality check on every draft", "Yes", "No", "Yes"],
  ["Client review and approval", "Yes", "No", "Yes"],
  ["Price per month", "$1,000+ per client", "$20–100", "$49–399"],
];

export function Compare() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
      <Reveal className="text-center">
        <Eyebrow>Why Leadloom</Eyebrow>
        <h2 className="serif mt-4 text-[42px] leading-[1.04] sm:text-[56px]">The agency workflow, <em>without the agency bill.</em></h2>
      </Reveal>
      <Reveal className="mt-12 overflow-x-auto" delay={100}>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="mono text-[11px] uppercase text-[var(--ink-2)]">
              <th className="py-3 font-normal" scope="col"><span className="sr-only">Feature</span></th>
              <th className="py-3 font-normal" scope="col">Content agency</th>
              <th className="py-3 font-normal" scope="col">Generic AI writer</th>
              <th className="rounded-t-2xl bg-[var(--ink)] px-4 py-3 font-normal text-white" scope="col">Leadloom</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([f, a, g, l], i) => (
              <tr key={f} className="border-t border-[var(--line)]">
                <th scope="row" className="py-4 pr-4 font-medium">{f}</th>
                <td className="py-4 text-[var(--ink-2)]">{a}</td>
                <td className="py-4 text-[var(--ink-2)]">{g}</td>
                <td className={`bg-[var(--ink)] px-4 py-4 font-medium text-white ${i === ROWS.length - 1 ? "rounded-b-2xl" : ""}`}>{l}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}

export function RetainerMath() {
  const a = PLANS.agency;
  return (
    <section className="relative mx-3 overflow-hidden rounded-[32px] bg-[var(--night)] text-white sm:mx-5">
      <Photo src={PHOTOS.night} position="50% 60%" overlay="linear-gradient(180deg, rgba(4,8,18,.55) 0%, rgba(4,8,18,.25) 55%, rgba(4,8,18,.55) 100%)" />
      <div className="relative mx-auto max-w-5xl px-6 pb-56 pt-24 text-center sm:pb-72">
        <Reveal>
          <Eyebrow light>The maths</Eyebrow>
          <h2 className="serif mt-4 text-[42px] leading-[1.04] sm:text-[60px]">Two client retainers <em>pay for it.</em></h2>
        </Reveal>
        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {[[`$${a.price}`, "a month on the Agency plan"], [`$${(a.price / a.piecesPerMonth).toFixed(2)}`, `per piece across ${a.piecesPerMonth} pieces`], ["2 × $500", "client retainers cover it, with profit left"]].map(([n, l], i) => (
            <Reveal key={l} delay={i * 120}>
              <p className="serif text-[56px] leading-none">{n}</p>
              <p className="mt-3 text-sm text-white/70">{l}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  const ids: PlanId[] = ["starter", "growth", "agency"];
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-28 sm:px-8">
      <Reveal className="text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="serif mt-4 text-[42px] leading-[1.04] sm:text-[56px]">Simple monthly plans.</h2>
        <p className="mt-4 text-[15px] text-[var(--ink-2)]">Start with 5 free pieces, no card. Cancel anytime. 7-day money-back on your first payment.</p>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {ids.map((id, i) => {
          const p = PLANS[id];
          const dark = id === "agency";
          return (
            <Reveal key={id} delay={i * 100} className={`flex flex-col rounded-[26px] p-7 ${dark ? "bg-[var(--ink)] text-white shadow-[0_40px_80px_-40px_rgba(28,26,23,.7)]" : "border border-[var(--line)] bg-[#fbf8f2]"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-medium">{p.name}</h3>
                {dark && <span className="mono rounded-full bg-[var(--amber)] px-2.5 py-1 text-[10px] uppercase text-[var(--ink)]">Best for agencies</span>}
              </div>
              <p className={`mt-1 text-sm ${dark ? "text-white/60" : "text-[var(--ink-2)]"}`}>{p.blurb}</p>
              <p className="serif mt-8 text-[64px] leading-none">${p.price}<span className={`ml-1 font-sans text-sm ${dark ? "text-white/60" : "text-[var(--ink-2)]"}`}>/month</span></p>
              <ul className={`mt-8 space-y-2.5 text-sm ${dark ? "text-white/85" : "text-[var(--ink)]"}`}>
                <li>{p.piecesPerMonth} pieces a month</li>
                <li>{p.brands} client brand{p.brands > 1 ? "s" : ""} · {p.seats} seats</li>
                <li>Voice profiles and funnel planner</li>
                <li>Quality check on every draft</li>
                <li>{p.whiteLabel ? "White-label client portal" : "Client review links"}</li>
              </ul>
              <div className="mt-auto pt-8">
                <Link href="/signup" className={`block rounded-full py-3 text-center text-sm font-medium ${dark ? "btn-light" : "btn-ink"}`}>Start free</Link>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

const FAQS = [
  ["Is this just ChatGPT with a nicer screen?", "No. ChatGPT gives you one-off text. Leadloom keeps a voice profile and fact sheet per client, plans connected funnels, scores every draft, and handles client approval and delivery. It’s the agency workflow, not a chat box."],
  ["Will my clients know I use AI?", "Only if you tell them. On the Agency plan the review portal is white-label, and you approve every piece before it goes out."],
  ["Does it make up facts?", "It only uses the proof points you give it for each client. Where a number would help but you haven’t provided one, it writes a placeholder like [ADD METRIC], and the quality check flags it until it’s filled in."],
  ["Do I still need to edit?", "Yes, and that’s the point. Leadloom does the research and first-draft work that eats your week. You keep the judgment your clients pay you for."],
  ["What happens after the free trial?", "You keep everything you made. To create more, pick a plan. No contracts; cancel anytime from the Billing page."],
  ["What’s your refund policy?", "If Leadloom isn’t right for you, ask within 7 days of your first payment and we’ll refund it in full."],
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-5 pb-28 sm:px-8">
      <Reveal className="text-center">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="serif mt-4 text-[42px] leading-[1.04] sm:text-[52px]">Questions agencies ask.</h2>
      </Reveal>
      <div className="mt-12 border-t border-[var(--line)]">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group border-b border-[var(--line)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16px] font-medium">
              {q}<span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[var(--ink-2)] transition group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="pb-6 pr-12 text-[15px] leading-7 text-[var(--ink-2)]">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <section className="relative mx-3 mb-3 overflow-hidden rounded-[32px] bg-[#3d3b26] text-white sm:mx-5 sm:mb-5">
      <Photo src={PHOTOS.field} position="50% 55%" overlay="linear-gradient(180deg, rgba(14,16,12,.55) 0%, rgba(14,16,12,.3) 50%, rgba(14,16,12,.5) 100%)" />
      <div className="relative mx-auto flex min-h-[640px] max-w-3xl flex-col items-center px-6 pt-28 text-center sm:min-h-[720px]">
        <Eyebrow light>Start this week</Eyebrow>
        <h2 className="serif mt-4 text-[46px] leading-[1.02] drop-shadow-[0_2px_20px_rgba(0,0,0,.25)] sm:text-[72px]">Try it on your most <em>demanding</em> client.</h2>
        <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/85">Build their funnel, send them the review link. If they approve faster than they do now, you’ll know.</p>
        <Link href="/signup" className="btn-light mt-8 rounded-full px-6 py-3 text-sm font-medium">Start free: 5 pieces, no card</Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mono mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-[11px] uppercase text-[var(--ink-2)] sm:flex-row">
      <span>© {new Date().getFullYear()} Leadloom</span>
      <span className="serif text-[15px] normal-case tracking-normal text-[var(--ink)]">Content that leads somewhere.</span>
      <nav className="flex gap-5" aria-label="Legal">
        <Link href="/terms" className="hover:text-[var(--ink)]">Terms</Link>
        <Link href="/privacy" className="hover:text-[var(--ink)]">Privacy</Link>
        <Link href="/refund-policy" className="hover:text-[var(--ink)]">Refunds</Link>
      </nav>
    </footer>
  );
}
