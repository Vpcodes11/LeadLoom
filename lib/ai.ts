import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { FORMATS, type Format } from "./formats";
import { geminiEnabled, geminiJson, geminiText } from "./gemini";

const MODEL = "claude-opus-5-5";
// Server-side refusal fallback: if the main model declines, the API reroutes inside the same call.
const BETAS = ["server-side-fallback-2026-07-01"];

const claudeEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

/** Which AI provider runs: AI_PROVIDER forces one; otherwise Gemini (free tier) wins when its key is set. */
export function aiProvider(): "gemini" | "claude" | null {
  const forced = process.env.AI_PROVIDER;
  if (forced === "claude" && claudeEnabled()) return "claude";
  if (forced === "gemini" && geminiEnabled()) return "gemini";
  if (geminiEnabled()) return "gemini";
  if (claudeEnabled()) return "claude";
  return null;
}
export const aiEnabled = () => aiProvider() !== null;

let _client: Anthropic | null = null;
const client = () => (_client ??= new Anthropic());

// ---------- Types ----------

export const VoiceProfileSchema = z.object({
  summary: z.string().describe("Two sentences describing how this brand sounds"),
  tone: z.array(z.string()).describe("3-6 tone adjectives"),
  pointOfView: z.string().describe("e.g. 'first person plural (we), speaks to reader as you'"),
  sentenceStyle: z.string().describe("Sentence length, rhythm, paragraph length, use of questions, lists"),
  vocabulary: z.array(z.string()).describe("Words and phrases this brand actually uses"),
  bannedWords: z.array(z.string()).describe("Words this brand would never use (include corporate jargon that clashes with the voice)"),
  dos: z.array(z.string()),
  donts: z.array(z.string()),
  sampleLines: z.array(z.string()).describe("3-5 short lines quoted verbatim from the samples that best show the voice"),
});
export type VoiceProfile = z.infer<typeof VoiceProfileSchema>;

const FORMAT_IDS = Object.keys(FORMATS) as [Format, ...Format[]];

export const FunnelPlanSchema = z.object({
  strategy: z.string().describe("3-5 sentences: who the funnel targets, the core argument, how pieces move readers toward the goal"),
  items: z.array(
    z.object({
      title: z.string(),
      format: z.enum(FORMAT_IDS),
      stage: z.enum(["awareness", "consideration", "decision"]),
      keyword: z.string().describe("Search keyword for blogs/landing pages, empty string otherwise"),
      angle: z.string().describe("The specific argument or promise of this piece, 1-2 sentences"),
      cta: z.string().describe("Where this piece sends the reader next (name the next piece or the offer)"),
    }),
  ),
});
export type FunnelPlan = z.infer<typeof FunnelPlanSchema>;

export type BrandContext = {
  name: string;
  website?: string | null;
  industry?: string | null;
  audience: string;
  offer: string;
  differentiators?: string | null;
  proofPoints?: string | null;
  competitors?: string | null;
  voiceProfile?: VoiceProfile | null;
};

// ---------- Prompts ----------

function brandBlock(b: BrandContext) {
  const lines = [
    `<brand>`,
    `Name: ${b.name}`,
    b.website && `Website: ${b.website}`,
    b.industry && `Industry: ${b.industry}`,
    `Ideal customer: ${b.audience}`,
    `Offer: ${b.offer}`,
    b.differentiators && `Differentiators: ${b.differentiators}`,
    b.competitors && `Competitors: ${b.competitors}`,
    `</brand>`,
    `<proof_points>\n${b.proofPoints?.trim() || "None provided."}\n</proof_points>`,
  ];
  if (b.voiceProfile) {
    const v = b.voiceProfile;
    lines.push(
      `<voice>`,
      `Summary: ${v.summary}`,
      `Tone: ${v.tone.join(", ")}`,
      `Point of view: ${v.pointOfView}`,
      `Sentence style: ${v.sentenceStyle}`,
      `Uses words like: ${v.vocabulary.join(", ")}`,
      `Never uses: ${v.bannedWords.join(", ")}`,
      `Do: ${v.dos.join("; ")}`,
      `Don't: ${v.donts.join("; ")}`,
      `Example lines in this voice:\n${v.sampleLines.map((l) => `- ${l}`).join("\n")}`,
      `</voice>`,
    );
  }
  return lines.filter(Boolean).join("\n");
}

const WRITER_SYSTEM = `You are a senior conversion copywriter and content strategist working inside a content agency. You write for one brand at a time, in that brand's voice, for its specific customer.

How you write:
- Sound like a knowledgeable human from the brand, not like an AI. Plain words, concrete specifics, short paragraphs.
- Never use these phrases: delve, game-changer, unlock, unleash, elevate, seamless, tapestry, "in today's fast-paced world", "it's important to note", "in conclusion", cutting-edge, revolutionize, supercharge, robust.
- Facts: use only the brand's proof points for claims about the brand's results. Never invent statistics, customer names, quotes, or study results. If a number would help but you don't have one, write a placeholder like [ADD METRIC: what to measure]. If you cite a general industry statistic, add [SOURCE] after it so an editor can verify.
- Every piece has exactly one job in the funnel and ends by sending the reader to the next step given in the brief.
- Output only the finished piece in Markdown. No preamble, no notes to the editor.`;

// ---------- Helpers ----------

function textOf(msg: Anthropic.Beta.BetaMessage) {
  if (msg.stop_reason === "refusal") throw new Error("The AI declined to write this piece. Try rephrasing the brief.");
  return msg.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

async function writeText(system: string, user: string, effort: "medium" | "high" = "high") {
  if (aiProvider() === "gemini") return geminiText(system, user, effort);
  const stream = client().beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: BETAS,
    fallbacks: "default",
    output_config: { effort },
    system,
    messages: [{ role: "user", content: user }],
  });
  return textOf(await stream.finalMessage());
}

// ---------- Public API ----------

export async function extractVoice(brand: BrandContext, samples: string): Promise<VoiceProfile> {
  if (!aiEnabled()) return mockVoice(brand);
  const voicePrompt = `Analyse the writing samples below and build a brand voice profile that another writer could follow to sound exactly like this brand. Base every observation on the samples; quote real lines for sampleLines.\n\n${brandBlock({ ...brand, voiceProfile: null })}\n\n<samples>\n${samples}\n</samples>`;
  if (aiProvider() === "gemini") return geminiJson(VoiceProfileSchema, voicePrompt);
  const res = await client().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: BETAS,
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(VoiceProfileSchema) },
    messages: [{
      role: "user",
      content: voicePrompt,
    }],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("Could not build a voice profile from these samples.");
  return res.parsed_output;
}

export async function planFunnel(brand: BrandContext, goal: string, pieces: number): Promise<FunnelPlan> {
  if (!aiEnabled()) return mockPlan(brand, goal, pieces);
  const planSystem = "You are a B2B and B2C content strategist who designs content funnels that turn interest into customers.";
  const planPrompt = `${brandBlock(brand)}

Design a connected content funnel with exactly ${pieces} pieces whose business goal is: "${goal}".

Rules:
- Cover all three stages. Roughly 40% awareness, 35% consideration, 25% decision.
- Awareness: blogs targeting real problem-aware search queries the ideal customer types, plus social posts.
- Consideration: comparison/how-to/methodology content, newsletters, case studies.
- Decision: landing page for the offer and an email sequence that converts subscribers.
- Every piece's cta names the next piece in the funnel (by its title) or the offer itself, so the funnel is one connected path.
- Keywords must be specific long-tail phrases, not single generic words.
- Order items in the sequence a reader would move through them.
Allowed formats: ${FORMAT_IDS.join(", ")}.`;
  if (aiProvider() === "gemini") return geminiJson(FunnelPlanSchema, planPrompt, planSystem);
  const res = await client().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: BETAS,
    fallbacks: "default",
    output_config: { effort: "high", format: betaZodOutputFormat(FunnelPlanSchema) },
    system: planSystem,
    messages: [{ role: "user", content: planPrompt }],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("Could not plan this funnel.");
  return res.parsed_output;
}

export type Brief = {
  title: string;
  format: string;
  stage: string;
  keyword?: string | null;
  angle?: string | null;
  cta?: string | null;
  notes?: string | null;
  funnelGoal?: string | null;
};

function briefBlock(b: Brief) {
  const spec = FORMATS[b.format as Format];
  return `<brief>
Title: ${b.title}
Format: ${spec?.label ?? b.format}
Funnel stage: ${b.stage}
${b.funnelGoal ? `Funnel goal: ${b.funnelGoal}\n` : ""}${b.keyword ? `Target keyword: ${b.keyword}\n` : ""}${b.angle ? `Angle: ${b.angle}\n` : ""}${b.cta ? `Call to action (next step): ${b.cta}\n` : ""}${b.notes ? `Client notes: ${b.notes}\n` : ""}Length: ${spec ? `${spec.words[0]}-${spec.words[1]} words` : "appropriate for the format"}
</brief>

<structure>
${spec?.structure ?? "Use the standard structure for this format."}
</structure>`;
}

export async function writeDraft(brand: BrandContext, brief: Brief): Promise<string> {
  if (!aiEnabled()) return mockDraft(brand, brief);
  return writeText(WRITER_SYSTEM, `${brandBlock(brand)}\n\n${briefBlock(brief)}\n\nWrite the piece now.`);
}

export async function reviseDraft(brand: BrandContext, brief: Brief, current: string, feedback: string): Promise<string> {
  if (!aiEnabled()) return `${current}\n\n<!-- Demo mode: revision requested: ${feedback.replace(/--/g, "")} -->`;
  return writeText(
    WRITER_SYSTEM,
    `${brandBlock(brand)}\n\n${briefBlock(brief)}\n\n<current_draft>\n${current}\n</current_draft>\n\n<feedback>\n${feedback}\n</feedback>\n\nRevise the draft to address every point of feedback. Keep everything that the feedback does not ask to change. Return the full revised piece.`,
  );
}

// ---------- Demo mode (no API key) ----------

function mockVoice(b: BrandContext): VoiceProfile {
  return {
    summary: `${b.name} sounds direct, practical and friendly. It talks to ${b.audience} like a peer who has solved the problem before.`,
    tone: ["direct", "practical", "warm", "confident"],
    pointOfView: "First person plural (we), addresses the reader as you",
    sentenceStyle: "Short sentences, 1-3 sentence paragraphs, occasional questions, bullet lists for steps",
    vocabulary: ["simple", "real results", "step by step", "no fluff"],
    bannedWords: ["synergy", "leverage", "best-in-class", "disrupt"],
    dos: ["Lead with the reader's problem", "Use concrete examples", "End with one clear next step"],
    donts: ["Hype", "Jargon", "Long intros"],
    sampleLines: ["(Demo mode) Add a GEMINI_API_KEY (free) or ANTHROPIC_API_KEY to extract real lines from your samples."],
  };
}

function mockPlan(b: BrandContext, goal: string, n: number): FunnelPlan {
  const base: FunnelPlan["items"] = [
    { title: `The 7 mistakes ${b.audience} make (and how to avoid them)`, format: "blog", stage: "awareness", keyword: `${b.industry ?? "business"} mistakes to avoid`, angle: "Name the costly mistakes and show a better way.", cta: "Read the step-by-step guide" },
    { title: "One thing most people get wrong", format: "linkedin_post", stage: "awareness", keyword: "", angle: "Contrarian insight from experience.", cta: "Read the full blog post" },
    { title: `A step-by-step guide to ${goal.toLowerCase()}`, format: "blog", stage: "awareness", keyword: `how to ${goal.toLowerCase()}`, angle: "Practical framework the reader can use today.", cta: "Subscribe to the newsletter" },
    { title: "What we learned from 100 projects", format: "newsletter", stage: "consideration", keyword: "", angle: "Patterns from real work.", cta: "See the case study" },
    { title: `How a client got results with ${b.name}`, format: "case_study", stage: "consideration", keyword: "", angle: "Before/after story with numbers.", cta: "See the offer" },
    { title: `${b.name}: ${b.offer}`, format: "landing_page", stage: "decision", keyword: `${b.industry ?? ""} ${goal}`.trim(), angle: "Make the offer irresistible and remove risk.", cta: "Book a call" },
    { title: "5-day welcome sequence", format: "email_sequence", stage: "decision", keyword: "", angle: "Turn subscribers into buyers.", cta: "Book a call" },
  ];
  // Pick a stage-balanced subset for small funnels, keep reader order.
  const priority = [0, 5, 4, 6, 1, 2, 3];
  const picked = n <= base.length ? priority.slice(0, n).sort((a, b) => a - b).map((i) => base[i]) : base;
  const items = Array.from({ length: n }, (_, i) => i < picked.length ? picked[i] : { ...base[i % base.length], title: `${base[i % base.length].title} (part ${Math.floor(i / base.length) + 1})` });
  return { strategy: `(Demo mode) A ${n}-piece funnel for ${b.audience} that moves readers from problem awareness to ${goal}. Add a GEMINI_API_KEY (free) or ANTHROPIC_API_KEY for a real AI-generated strategy.`, items };
}

async function mockDraft(b: BrandContext, brief: Brief) {
  await new Promise((r) => setTimeout(r, 2000)); // simulate AI latency so the background-job UI is exercised
  return `# ${brief.title}

> **Demo mode.** Add a \`GEMINI_API_KEY\` (free) or \`ANTHROPIC_API_KEY\` to \`.env\` to generate real drafts in ${b.name}'s voice.

## The problem

${b.audience} keep running into the same wall. Here is what is really going on.

## A better way

${b.offer}. Here is how it works, step by step.

## What results look like

[ADD METRIC: result from a real client]

## Next step

${brief.cta ?? "Book a call"} [link]
`;
}
