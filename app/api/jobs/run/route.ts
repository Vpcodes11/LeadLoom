import { NextResponse } from "next/server";
import { recoverJobs } from "@/lib/jobs";

export const maxDuration = 300;

/** Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const ran = await recoverJobs();
  return NextResponse.json({ ran });
}
