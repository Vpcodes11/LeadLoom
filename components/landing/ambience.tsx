import type { CSSProperties } from "react";

/**
 * Cosy life over the films: birds gliding across the sky, butterflies over the meadow, sparkles rising
 * from the lamp, glints where the threads meet, fireflies at night.
 * Pure CSS animations on tiny elements, moving only by transform and opacity (GPU compositor, no script
 * per frame). Positions are percentages of the section; the desk and lamp sit near (50%, 79%).
 * Classes ending in -d are desktop-only. Hidden entirely with reduced motion (landing.css).
 */
type Vars = CSSProperties & Record<`--${string}`, string>;
const v = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, val]) => [`--${k}`, val])) as Vars;

function Bird({ y, w, d, delay, bob, rtl, desk }: { y: string; w: string; d: string; delay: string; bob: string; rtl?: boolean; desk?: boolean }) {
  return (
    <div className={`amb-bird${rtl ? " amb-rtl" : ""}${desk ? " amb-d" : ""}`} style={v({ y, w, d, delay, bob })}>
      <svg viewBox="0 0 40 16" width="100%" aria-hidden>
        <path className="amb-wing-l" d="M20 9 C14 3, 7 3, 1 6 C8 6, 14 8, 20 11Z" />
        <path className="amb-wing-r" d="M20 9 C26 3, 33 3, 39 6 C32 6, 26 8, 20 11Z" />
        <ellipse cx="20" cy="10" rx="2.6" ry="1.6" />
      </svg>
    </div>
  );
}

function Butterfly({ x, y, c, s, dx, dy, tx, ty, desk }: { x: string; y: string; c: string; s: string; dx: string; dy: string; tx: string; ty: string; desk?: boolean }) {
  return (
    <div className={`amb-bf-x${desk ? " amb-d" : ""}`} style={v({ x, y, dx, tx })}>
      <div className="amb-bf-y" style={v({ dy, ty })}>
        <svg className="amb-bf" viewBox="0 0 24 20" style={v({ c, s })} aria-hidden>
          <g className="amb-bf-l">
            <path d="M12 9 C8 1, 1 1, 2 7 C3 11, 8 11, 12 10Z" />
            <path d="M12 11 C8 12, 4 15, 6 18 C8 20, 11 16, 12 12Z" opacity=".85" />
          </g>
          <g className="amb-bf-r">
            <path d="M12 9 C16 1, 23 1, 22 7 C21 11, 16 11, 12 10Z" />
            <path d="M12 11 C16 12, 20 15, 18 18 C16 20, 13 16, 12 12Z" opacity=".85" />
          </g>
          <rect x="11.4" y="7" width="1.2" height="8" rx=".6" fill="#3b2a1f" />
        </svg>
      </div>
    </div>
  );
}

const Mote = ({ x, y, s, d, delay, dx, dy, desk }: { x: string; y: string; s: string; d: string; delay: string; dx: string; dy: string; desk?: boolean }) =>
  <span className={`amb-mote${desk ? " amb-d" : ""}`} style={v({ x, y, s, d, delay, dx, dy })} />;

/** A soft warm halo around the lamp, slowly breathing. */
const LampGlow = ({ strong }: { strong?: boolean }) => <span className={`amb-glow${strong ? " amb-glow-strong" : ""}`} />;

const Glint = ({ x, y, s, d, delay }: { x: string; y: string; s: string; d: string; delay: string }) => (
  <svg className="amb-glint" viewBox="0 0 20 20" style={v({ x, y, s, d, delay })} aria-hidden>
    <path d="M10 0 C10.8 7, 13 9.2, 20 10 C13 10.8, 10.8 13, 10 20 C9.2 13, 7 10.8, 0 10 C7 9.2, 9.2 7, 10 0Z" />
  </svg>
);

const Firefly = ({ x, y, d, delay, dx, dy, desk }: { x: string; y: string; d: string; delay: string; dx: string; dy: string; desk?: boolean }) => (
  <span className={`amb-ff-x${desk ? " amb-d" : ""}`} style={v({ x, y, dx, d })}>
    <span className="amb-ff" style={v({ dy, d, delay })} />
  </span>
);

/** Sparkles rising from the lamp toward the sky, along the threads. */
const LAMP_MOTES = [
  { x: "49%", y: "76%", s: "8px", d: "7s", delay: "0s", dx: "-6vw", dy: "-34vh" },
  { x: "51%", y: "77%", s: "7px", d: "8.5s", delay: "1.2s", dx: "7vw", dy: "-40vh" },
  { x: "50%", y: "75%", s: "10px", d: "9s", delay: "2.6s", dx: "-12vw", dy: "-46vh" },
  { x: "50.5%", y: "76%", s: "5px", d: "6.5s", delay: "3.4s", dx: "3vw", dy: "-30vh" },
  { x: "49.5%", y: "77%", s: "8px", d: "10s", delay: "4.8s", dx: "14vw", dy: "-50vh", desk: true },
  { x: "50%", y: "76%", s: "7px", d: "8s", delay: "5.9s", dx: "-2vw", dy: "-42vh", desk: true },
  { x: "51%", y: "75%", s: "5px", d: "7.5s", delay: "6.8s", dx: "-16vw", dy: "-38vh", desk: true },
  { x: "50%", y: "77%", s: "7px", d: "9.5s", delay: "0.6s", dx: "10vw", dy: "-36vh" },
  { x: "49%", y: "76%", s: "6px", d: "8s", delay: "3.9s", dx: "-9vw", dy: "-44vh" },
  { x: "50.5%", y: "75%", s: "8px", d: "11s", delay: "7.4s", dx: "5vw", dy: "-52vh", desk: true },
];

/** Sparkles drifting up from anywhere along a short strip (no lamp in frame). */
const BAND_MOTES = [
  { x: "14%", y: "92%", s: "6px", d: "7s", delay: "0s", dx: "2vw", dy: "-14vh" },
  { x: "33%", y: "96%", s: "8px", d: "8.5s", delay: "2.1s", dx: "-3vw", dy: "-16vh" },
  { x: "58%", y: "94%", s: "6px", d: "7.5s", delay: "4.2s", dx: "3vw", dy: "-13vh" },
  { x: "79%", y: "95%", s: "7px", d: "9s", delay: "1.1s", dx: "-2vw", dy: "-15vh", desk: true },
  { x: "91%", y: "93%", s: "5px", d: "8s", delay: "5.6s", dx: "-4vw", dy: "-12vh", desk: true },
];

export function Ambience({ scene }: { scene: "day" | "night" | "dusk" | "band" }) {
  return (
    <div className="amb pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {scene === "day" && (
        <>
          <LampGlow />
          <Bird y="16%" w="36px" d="34s" delay="-6s" bob="-3vh" />
          <Bird y="21%" w="24px" d="34s" delay="-5.2s" bob="-2vh" />
          <Bird y="11%" w="28px" d="46s" delay="-28s" bob="2vh" rtl desk />
          <Bird y="27%" w="20px" d="52s" delay="-14s" bob="-2vh" desk />
          <Glint x="50%" y="58%" s="16px" d="3.2s" delay="0s" />
          <Glint x="44%" y="46%" s="10px" d="4.1s" delay="1.3s" />
          <Glint x="57%" y="42%" s="12px" d="3.7s" delay="2.4s" />
          <Butterfly x="30%" y="84%" c="#f6c76c" s="22px" dx="9vw" dy="-6vh" tx="11s" ty="4.2s" />
          <Butterfly x="68%" y="88%" c="#fbf1de" s="18px" dx="-8vw" dy="-5vh" tx="13s" ty="3.6s" />
          <Butterfly x="80%" y="80%" c="#ee9455" s="16px" dx="-10vw" dy="-4vh" tx="15s" ty="4.8s" desk />
          {LAMP_MOTES.map((m, i) => <Mote key={i} {...m} />)}
        </>
      )}
      {scene === "night" && (
        <>
          <LampGlow strong />
          {LAMP_MOTES.slice(0, 5).map((m, i) => <Mote key={i} {...m} />)}
          <Firefly x="18%" y="78%" d="7s" delay="0s" dx="5vw" dy="-4vh" />
          <Firefly x="31%" y="86%" d="9s" delay="-2s" dx="-4vw" dy="-6vh" />
          <Firefly x="42%" y="72%" d="8s" delay="-4s" dx="3vw" dy="-3vh" />
          <Firefly x="60%" y="84%" d="10s" delay="-1s" dx="-5vw" dy="-5vh" />
          <Firefly x="71%" y="75%" d="7.5s" delay="-6s" dx="4vw" dy="-4vh" />
          <Firefly x="84%" y="88%" d="9.5s" delay="-3s" dx="-3vw" dy="-6vh" />
          <Firefly x="10%" y="90%" d="11s" delay="-5s" dx="6vw" dy="-3vh" desk />
          <Firefly x="90%" y="70%" d="8.5s" delay="-7s" dx="-5vw" dy="-4vh" desk />
          <Firefly x="53%" y="92%" d="12s" delay="-2.5s" dx="2vw" dy="-7vh" desk />
        </>
      )}
      {scene === "band" && (
        <>
          <Bird y="24%" w="26px" d="30s" delay="-9s" bob="-2vh" />
          <Bird y="34%" w="18px" d="30s" delay="-8.3s" bob="-1.5vh" />
          <Bird y="18%" w="22px" d="40s" delay="-22s" bob="1.5vh" rtl desk />
          <Glint x="22%" y="40%" s="12px" d="3.6s" delay="0s" />
          <Glint x="64%" y="28%" s="10px" d="4.2s" delay="1.6s" />
          <Glint x="86%" y="54%" s="12px" d="3.9s" delay="2.8s" />
          {BAND_MOTES.map((m, i) => <Mote key={i} {...m} />)}
        </>
      )}
      {scene === "dusk" && (
        <>
          <LampGlow />
          <Bird y="18%" w="28px" d="40s" delay="-12s" bob="-2vh" />
          <Butterfly x="36%" y="82%" c="#f6c76c" s="20px" dx="8vw" dy="-5vh" tx="12s" ty="4s" />
          <Butterfly x="64%" y="86%" c="#fbf1de" s="16px" dx="-7vw" dy="-4vh" tx="14s" ty="3.4s" desk />
          {LAMP_MOTES.slice(0, 4).map((m, i) => <Mote key={i} {...m} />)}
        </>
      )}
    </div>
  );
}
