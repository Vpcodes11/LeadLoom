import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { PLANS, type PlanId } from "@/lib/plans";
import { billingEnabled, changePlan, createCheckout, productOf } from "@/lib/billing";

export async function POST(req: Request) {
  const { workspace, user, role } = await requireUser();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  if (role !== "owner") return NextResponse.redirect(`${base}/app/billing?error=owner`, 303);
  const plan = String((await req.formData()).get("plan")) as PlanId;
  if (!(plan in PLANS) || plan === "trial" || !billingEnabled() || !productOf(plan)) {
    return NextResponse.redirect(`${base}/app/billing?error=billing`, 303);
  }
  try {
    // Already subscribed: switch the existing subscription instead of starting a second one.
    if (workspace.billingSubscriptionId && workspace.plan !== "trial") {
      await changePlan(workspace.billingSubscriptionId, plan);
      return NextResponse.redirect(`${base}/app/billing?changed=1`, 303);
    }
    const url = await createCheckout({ plan, workspaceId: workspace.id, email: user.email, name: user.name, returnUrl: `${base}/api/billing/return` });
    return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error("checkout failed", e);
    return NextResponse.redirect(`${base}/app/billing?error=checkout`, 303);
  }
}
