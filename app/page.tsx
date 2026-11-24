import Image from "next/image";
import Link from "next/link";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/landing/nav";
import { Scene } from "@/components/landing/scene";
import { Steps } from "@/components/landing/steps";
import { QaMeter } from "@/components/landing/qa-meter";
import { Reveal } from "@/components/landing/reveal";
import { Closing, Compare, Eyebrow, Faq, Footer, Pricing, Portal, Problem, RetainerMath } from "@/components/landing/sections";
import "./landing.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-ll-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-ll-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-ll-mono", display: "swap" });

export default function Home() {
  return (
    <div className={`ll ${serif.variable} ${sans.variable} ${mono.variable} min-h-screen pt-3 sm:pt-5`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Nav />

      {/* Hero: a painted dusk meadow; golden threads gather from the whole sky into one lamp. */}
      <section className="relative mx-3 overflow-hidden rounded-[32px] text-white sm:mx-5">
        <Scene variant="dawn" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b2a4a]/40 via-transparent via-55% to-[#14200f]/45" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center px-6 pb-10 pt-36 text-center sm:pt-44">
          <p className="rise glass mono rounded-full px-3.5 py-1.5 text-[11px] uppercase" style={{ animationDelay: "80ms" }}>For marketing &amp; SEO agencies</p>
          <h1 className="rise serif mt-7 text-[54px] leading-[0.98] drop-shadow-[0_2px_24px_rgba(20,30,60,.35)] sm:text-[84px] lg:text-[104px]" style={{ animationDelay: "180ms" }}>
            Content that <em>leads</em> somewhere.
          </h1>
          <p className="rise mt-6 max-w-xl text-[16px] leading-7 text-white/90 sm:text-[17px]" style={{ animationDelay: "320ms" }}>
            Leadloom learns each client’s voice, plans content funnels that end in a sale, writes and quality-checks every draft, and gets client sign-off with one link.
          </p>
          <div className="rise mt-9 flex flex-col items-center gap-3 sm:flex-row" style={{ animationDelay: "460ms" }}>
            <Link href="/signup" className="btn-light rounded-full px-6 py-3 text-sm font-medium">Start free: 5 pieces, no card</Link>
            <a href="#how" className="glass rounded-full px-6 py-3 text-sm font-medium">See how it works</a>
          </div>
          <p className="rise mono mt-auto pt-16 text-[11px] uppercase text-white/80" style={{ animationDelay: "620ms" }}>
            Voice → Funnel → Draft → Quality check → Client approval
          </p>
        </div>
      </section>

      <main id="main">
        {/* Product reveal */}
        <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 sm:pt-32">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>One workspace for every client</Eyebrow>
            <h2 className="serif mt-4 text-[42px] leading-[1.04] sm:text-[58px]">Strategy, writing and sign-off. <em>Woven together.</em></h2>
          </Reveal>
          <Reveal className="frame mx-auto mt-14 max-w-5xl" delay={120}>
            <div className="screen">
              <Image src="/product/dashboard.png" alt="Leadloom dashboard showing every client's content and what needs attention" width={2880} height={1800} sizes="(min-width: 1024px) 1000px, 100vw" className="h-auto w-full" priority />
            </div>
          </Reveal>
        </section>

        <Problem />

        <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16 sm:px-8">
          <Reveal className="mb-6 lg:mb-0">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="serif mt-4 max-w-2xl text-[42px] leading-[1.04] sm:text-[56px]">From a client’s goal to approved content.</h2>
          </Reveal>
          <Steps />
        </section>

        <section id="quality" className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-14 px-5 py-28 sm:px-8 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>Quality check</Eyebrow>
            <h2 className="serif mt-4 text-[42px] leading-[1.04] sm:text-[56px]">Every draft is checked <em>before you read it.</em></h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-[var(--ink-2)]">Ten checks on every piece, scored 0–100: length, readability, AI-sounding phrases, the brand’s banned words, unsourced statistics, keyword placement, structure and a clear next step. The same draft always gets the same score.</p>
          </Reveal>
          <Reveal delay={120}><QaMeter /></Reveal>
        </section>

        <Portal />
        <Compare />
        <RetainerMath />
        <Pricing />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
