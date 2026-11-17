import type { Brand } from "@prisma/client";
import type { BrandContext, VoiceProfile } from "./ai";

export function parseVoice(json: string | null | undefined): VoiceProfile | null {
  if (!json) return null;
  try { return JSON.parse(json) as VoiceProfile; } catch { return null; }
}

export function brandContext(b: Brand): BrandContext {
  return { ...b, voiceProfile: parseVoice(b.voiceProfile) };
}
