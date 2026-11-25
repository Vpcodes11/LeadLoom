import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiEnabled } from "@/lib/ai";
import { billingEnabled } from "@/lib/billing";

export const dynamic = "force-dynamic";

/** Uptime check: database round-trip plus which integrations are configured (no secrets). */
export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, dbMs: Date.now() - started, ai: aiEnabled(), billing: billingEnabled() });
  } catch (e) {
    console.error("health check failed", e);
    return NextResponse.json({ ok: false, error: "database unreachable" }, { status: 503 });
  }
}
