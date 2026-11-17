import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "not configured" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const workspaceId = s.metadata?.workspaceId;
    const plan = s.metadata?.plan;
    if (workspaceId && plan && plan in PLANS) {
      await db.workspace.update({
        where: { id: workspaceId },
        data: { plan, subscriptionStatus: "active", stripeCustomerId: String(s.customer), stripeSubscriptionId: String(s.subscription) },
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const workspaceId = sub.metadata?.workspaceId;
    if (workspaceId) {
      const active = sub.status === "active" || sub.status === "trialing";
      const plan = event.type === "customer.subscription.deleted" || !active ? "trial" : sub.metadata?.plan ?? "trial";
      await db.workspace.update({ where: { id: workspaceId }, data: { plan, subscriptionStatus: sub.status } });
    }
  }
  return NextResponse.json({ received: true });
}
