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
/**
 * Models tried in order. Free-tier models get "high demand" 503s and 429 rate limits,
 * so a busy model falls through to the next one right away. GEMINI_MODEL (comma-separated)
 * overrides the list. All three defaults have a free tier.
 */
const models = () =>
  (process.env.GEMINI_MODEL || "gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

type Interaction = {
  status?: string;
  steps?: { type: string; content?: { type: string; text?: string }[] }[];
  error?: { message?: string };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function interact(body: Record<string, unknown>): Promise<string> {
  // Each model once, then one more pass after a pause. Busy (429/5xx) or slow models are skipped.
  const plan = [...models().map((m) => ({ m, delay: 0 })), ...models().map((m, i) => ({ m, delay: i === 0 ? 10_000 : 0 }))];
  let lastError = "";
  for (const [attempt, { m: model, delay }] of plan.entries()) {
    if (delay) await sleep(delay);
    const started = Date.now();
    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": String(process.env.GEMINI_API_KEY),
          "Api-Revision": API_REVISION,
        },
        body: JSON.stringify({ model, store: false, ...body }),
        cache: "no-store",
        signal: AbortSignal.timeout(45_000),
      });
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.error(`[gemini] attempt ${attempt + 1} model=${model} network/timeout after ${Date.now() - started}ms: ${lastError}`);
      continue;
    }
    console.log(`[gemini] attempt ${attempt + 1} model=${model} status=${res.status} in ${Date.now() - started}ms`);
    if (res.status === 429 || res.status >= 500) {
      lastError = `${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`;
      console.error(`[gemini] retryable error: ${lastError}`);
      continue;
    }
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 500);
      console.error(`[gemini] request failed: ${res.status} ${detail}`);
      throw new Error(`Gemini request failed: ${res.status} ${detail}`);
    }
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
