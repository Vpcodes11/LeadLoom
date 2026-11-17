import "server-only";
import { headers } from "next/headers";
import { db } from "./db";

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

/** Returns false if `key` has already been hit `max` times within `windowMs`. Records a hit when allowed. */
export async function rateLimit(key: string, max: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  const hits = await db.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  if (hits >= max) return false;
  await db.rateLimitHit.create({ data: { key } });
  // Opportunistic cleanup of old rows.
  if (Math.random() < 0.02) await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 86_400_000) } } });
  return true;
}
