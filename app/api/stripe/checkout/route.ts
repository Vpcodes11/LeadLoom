import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { PLANS, type PlanId } from "@/lib/plans";
import { stripe, stripeEnabled } from "@/lib/stripe";

export async function POST(req: Request) {
  const { workspace, user } = await requireUser();
  const plan = String((await req.formData()).get("plan")) as PlanId;
  const priceId = PLANS[plan]?.priceEnv ? process.env[PLANS[plan].priceEnv!] : undefined;
  const base = process.env.APP_URL ?? "http://localhost:3000";
  if (!stripeEnabled() || !priceId) return NextResponse.redirect(`${base}/app/billing?error=stripe`, 303);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: workspace.stripeCustomerId ?? undefined,
    customer_email: workspace.stripeCustomerId ? undefined : user.email,
    client_reference_id: workspace.id,
    metadata: { workspaceId: workspace.id, plan },
    subscription_data: { metadata: { workspaceId: workspace.id, plan } },
    success_url: `${base}/app/billing?success=1`,
    cancel_url: `${base}/app/billing`,
  });
  return NextResponse.redirect(session.url!, 303);
}
