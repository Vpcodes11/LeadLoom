import "server-only";
import { z } from "zod/v4";

/**
 * Google Gemini via the Interactions API (REST, no SDK).
 * Docs: https://ai.google.dev/api/interactions
 * The default model, gemini-3.8-flash, has a free tier (rate-limited). On the free tier
 * Google may use prompts and responses to improve its products; see the Privacy page.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const API_REVISION = "2026-05-20";

export const geminiEnabled = () => Boolean(process.env.GEMINI_API_KEY);
const model = () => process.env.GEMINI_MODEL || "gemini-3.8-flash";

type Interaction = {
  status?: string;
  steps?: { type: string; content?: { type: string; text?: string }[] }[];
  error?: { message?: string };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function interact(body: Record<string, unknown>): Promise<string> {
  // Free-tier rate limits return 429; overloaded models return 503. Back off and retry.
  const delays = [0, 8_000, 20_000, 45_000];
  let lastError = "";
  for (const delay of delays) {
    if (delay) await sleep(delay);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": String(process.env.GEMINI_API_KEY),
        "Api-Revision": API_REVISION,
      },
      body: JSON.stringify({ model: model(), store: false, ...body }),
      cache: "no-store",
    });
    if (res.status === 429 || res.status >= 500) {
      lastError = `${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`;
      continue;
    }
    if (!res.ok) throw new Error(`Gemini request failed: ${res.status} ${(await res.text().catch(() => "")).slice(0, 500)}`);
    const data = (await res.json()) as Interaction;
    const text = (data.steps ?? [])
      .filter((s) => s.type === "model_output")
      .flatMap((s) => s.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("")
      .trim();
    if (!text) throw new Error(`Gemini returned no text (status ${data.status ?? "unknown"}${data.error?.message ? `: ${data.error.message}` : ""}).`);
    return text;
  }
  throw new Error(`The AI is busy right now (rate limit). Please try again in a minute. [${lastError}]`);
}

/** Free-form Markdown/text generation. */
export function geminiText(system: string, input: string, thinking: "low" | "medium" | "high" = "medium") {
  return interact({ system_instruction: system, input, generation_config: { thinking_level: thinking, max_output_tokens: 32000 } });
}

/** JSON output that must match a Zod schema (validated after parsing). */
export async function geminiJson<T extends z.ZodType>(schema: T, input: string, system?: string): Promise<z.infer<T>> {
  const { $schema: _ignored, ...jsonSchema } = z.toJSONSchema(schema) as Record<string, unknown>;
  const text = await interact({
    ...(system ? { system_instruction: system } : {}),
    input,
    generation_config: { thinking_level: "medium", max_output_tokens: 16000 },
    response_format: { type: "text", mime_type: "application/json", schema: jsonSchema },
  });
  // Tolerate a fenced ```json block, just in case.
  const raw = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return schema.parse(JSON.parse(raw));
}
