import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { keepsAccess, verifyWebhook, workspaceBillingState, type DodoSubscription } from "@/lib/billing";

type DodoEvent = { business_id: string; type: string; timestamp: string; data: DodoSubscription & { payload_type?: string } };

/**
 * Dodo Payments webhook (Standard Webhooks signatures). Subscribe the endpoint to all
 * subscription.* events. Each event carries the full subscription, so the handler just
 * syncs the workspace to the subscription's current state (safe to receive twice).
 */
export async function POST(req: Request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 400 });
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers, secret)) return NextResponse.json({ error: "bad signature" }, { status: 400 });

  const event = JSON.parse(raw) as DodoEvent;
  if (!event.type?.startsWith("subscription.") || !event.data?.subscription_id) {
    return NextResponse.json({ received: true, ignored: event.type });
  }
  const sub = event.data;

  // Match by our workspace ID in the subscription metadata, else by the stored subscription ID.
  const tagged = sub.metadata?.workspace_id ? String(sub.metadata.workspace_id) : null;
  const workspace = tagged
    ? await db.workspace.findUnique({ where: { id: tagged }, select: { id: true, billingSubscriptionId: true } })
    : await db.workspace.findFirst({ where: { billingSubscriptionId: sub.subscription_id }, select: { id: true, billingSubscriptionId: true } });
  // Not linked yet: the post-checkout return step links it and tags the subscription.
  if (!workspace) return NextResponse.json({ received: true, ignored: "unknown workspace" });

  // A late event about an old, ended subscription must not downgrade a newer one.
  if (workspace.billingSubscriptionId && workspace.billingSubscriptionId !== sub.subscription_id && !keepsAccess(sub.status)) {
    return NextResponse.json({ received: true, ignored: "stale subscription" });
  }

  await db.workspace.update({ where: { id: workspace.id }, data: workspaceBillingState(sub) });
  return NextResponse.json({ received: true });
}
