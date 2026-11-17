import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { stripe, stripeEnabled } from "@/lib/stripe";

export async function POST() {
  const { workspace, role } = await requireUser();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  if (role !== "owner" || !stripeEnabled() || !workspace.stripeCustomerId) return NextResponse.redirect(`${base}/app/billing`, 303);
  const s = await stripe().billingPortal.sessions.create({ customer: workspace.stripeCustomerId, return_url: `${base}/app/billing` });
  return NextResponse.redirect(s.url, 303);
}
