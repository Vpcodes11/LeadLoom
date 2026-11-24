import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { billingEnabled, customerPortalUrl } from "@/lib/billing";

export async function POST() {
  const { workspace, role } = await requireUser();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  if (role !== "owner" || !billingEnabled() || !workspace.billingCustomerId) return NextResponse.redirect(`${base}/app/billing`, 303);
  try {
    return NextResponse.redirect(await customerPortalUrl(workspace.billingCustomerId, `${base}/app/billing`), 303);
  } catch (e) {
    console.error("customer portal failed", e);
    return NextResponse.redirect(`${base}/app/billing?error=portal`, 303);
  }
}
