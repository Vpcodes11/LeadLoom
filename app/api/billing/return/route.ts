import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { billingEnabled, getSubscription, tagSubscription, workspaceBillingState } from "@/lib/billing";

export const dynamic = "force-dynamic";

/**
 * Dodo redirects here after checkout with ?subscription_id=…&status=….
 * The query string can't be trusted, so the subscription is fetched from Dodo and only
 * linked when it belongs to this workspace (checkout metadata) or to this owner's email.
 * This also tags the subscription with the workspace ID so all later webhooks match.
 */
export async function GET(req: Request) {
  const { workspace, user, role } = await requireUser();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const subscriptionId = new URL(req.url).searchParams.get("subscription_id");
  if (role !== "owner" || !subscriptionId || !billingEnabled()) return NextResponse.redirect(`${base}/app/billing`, 303);

  try {
    const sub = await getSubscription(subscriptionId);
    const taggedWorkspace = sub.metadata?.workspace_id ? String(sub.metadata.workspace_id) : null;
    const ownsIt = taggedWorkspace ? taggedWorkspace === workspace.id : sub.customer.email.toLowerCase() === user.email.toLowerCase();
    if (!ownsIt) return NextResponse.redirect(`${base}/app/billing?error=checkout`, 303);

    const state = workspaceBillingState(sub);
    await db.workspace.update({ where: { id: workspace.id }, data: state });
    if (!taggedWorkspace) {
      await tagSubscription(sub.subscription_id, workspace.id, state.plan).catch((e) => console.error("tag subscription failed", e));
    }
    // "pending" means the payment is still being confirmed; the webhook finishes the upgrade.
    return NextResponse.redirect(`${base}/app/billing?success=1`, 303);
  } catch (e) {
    console.error("billing return failed", e);
    return NextResponse.redirect(`${base}/app/billing?success=1`, 303);
  }
}
