export type Format = "blog" | "landing_page" | "email_sequence" | "case_study" | "linkedin_post" | "newsletter";
export type Stage = "awareness" | "consideration" | "decision";

export const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: "awareness", label: "Awareness", hint: "Attract people who have the problem" },
  { id: "consideration", label: "Consideration", hint: "Show your way is the right way" },
  { id: "decision", label: "Decision", hint: "Remove doubt and ask for the sale" },
];

export const FORMATS: Record<Format, { label: string; words: [number, number]; structure: string }> = {
  blog: {
    label: "Blog post",
    words: [1200, 2200],
    structure: `- H1 title that contains the target keyword naturally
- Intro (under 120 words): name the reader's problem in their words, promise a specific outcome. Keyword in the first 100 words.
- 4-7 H2 sections, each answering one real question the reader has. Use H3 only when needed.
- Concrete examples, steps, or numbers in every section. No filler.
- A short section that connects the problem to the brand's approach (no hard sell).
- Closing with one clear call to action pointing to the next piece in the funnel.`,
  },
  landing_page: {
    label: "Landing page",
    words: [500, 1100],
    structure: `- Hero: headline (outcome, not feature), subheadline (who it is for + how), primary CTA button text
- Problem section: 3 pains in the customer's words
- Solution: how the offer solves each pain
- Proof: results, testimonials, logos, numbers (only from provided proof points)
- How it works: 3 steps
- Objection handling: 4-6 FAQ entries
- Final CTA block with risk reversal
Use "## Section name" headings and mark buttons as **[Button: text]**.`,
  },
  email_sequence: {
    label: "Email sequence (5 emails)",
    words: [900, 1800],
    structure: `- 5 emails, each starting with "## Email N — send on day X"
- Each email: **Subject:**, **Preview:**, body, and one CTA link placeholder like [link]
- Email 1 delivers value, 2 shares a story/insight, 3 handles the biggest objection, 4 shows proof, 5 makes the offer with urgency that is honest
- Short paragraphs, plain text feel, one idea per email`,
  },
  case_study: {
    label: "Case study",
    words: [700, 1300],
    structure: `- Title with the result ("How X achieved Y in Z")
- Snapshot box: client, industry, challenge, result (as a short bullet list)
- The challenge (before state, in the client's words where possible)
- Why they chose the brand
- What was done (specific steps)
- Results (numbers only from provided proof points; mark missing numbers as [ADD METRIC])
- Quote placeholder if no quote provided: [CLIENT QUOTE]
- CTA`,
  },
  linkedin_post: {
    label: "LinkedIn post",
    words: [120, 300],
    structure: `- First line is a hook that stops the scroll (under 12 words)
- Short lines, white space, one idea
- A specific insight, story, or contrarian point
- End with a question or a soft CTA
- Max 3 hashtags at the end`,
  },
  newsletter: {
    label: "Newsletter issue",
    words: [400, 900],
    structure: `- Subject line and preview text first
- One main idea with a story or example
- 2-3 practical takeaways
- One CTA`,
  },
};

export const STATUSES = [
  { id: "requested", label: "Requested" },
  { id: "planned", label: "Planned" },
  { id: "draft", label: "Draft" },
  { id: "in_review", label: "In review" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "approved", label: "Approved" },
  { id: "delivered", label: "Delivered" },
] as const;

export function statusLabel(id: string) {
  return STATUSES.find((s) => s.id === id)?.label ?? id;
}
export function formatLabel(id: string) {
  return FORMATS[id as Format]?.label ?? id;
}
