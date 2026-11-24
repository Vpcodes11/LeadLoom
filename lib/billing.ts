import "server-only";
import { PLANS, type PlanId } from "./plans";
export { verifyWebhook } from "./webhook-signature";

/**
 * Dodo Payments billing (merchant of record: it charges customers, handles global
 * sales tax/VAT and pays out to you). Talks to the REST API directly with fetch.
 * Docs: https://docs.dodopayments.com
 */

const apiBase = () =>
  process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

export const billingEnabled = () => Boolean(process.env.DODO_PAYMENTS_API_KEY);

/** Dodo product ID configured for a paid plan, if any. */
export const productOf = (plan: PlanId) => {
  const env = PLANS[plan]?.productEnv;
  return env ? process.env[env] || undefined : undefined;
};

/** Reverse lookup: which plan a Dodo product belongs to. */
export function planForProduct(productId: string | null | undefined): PlanId | null {
  if (!productId) return null;
  for (const id of Object.keys(PLANS) as PlanId[]) {
    if (productOf(id) === productId) return id;
  }
  return null;
}

async function dodo<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Dodo ${init.method ?? "GET"} ${path} failed: ${res.status} ${body.slice(0, 500)}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export type DodoSubscription = {
  subscription_id: string;
  product_id: string;
  status: string; // pending | active | on_hold | paused | cancelled | failed | expired | past_due
  customer: { customer_id: string; email: string; name?: string };
  metadata?: Record<string, string | number | boolean>;
};

/** Creates a hosted checkout session for a plan and returns its URL. */
export async function createCheckout(opts: { plan: PlanId; workspaceId: string; email: string; name?: string; returnUrl: string }) {
  const productId = productOf(opts.plan);
  if (!productId) throw new Error(`No Dodo product configured for ${opts.plan}`);
  const res = await dodo<{ session_id: string; checkout_url: string }>("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: opts.email, name: opts.name },
      metadata: { workspace_id: opts.workspaceId, plan: opts.plan },
      return_url: opts.returnUrl,
    }),
  });
  return res.checkout_url;
}

export const getSubscription = (id: string) => dodo<DodoSubscription>(`/subscriptions/${encodeURIComponent(id)}`);

/** Stores our workspace ID on the subscription so every later webhook can be matched. */
export const tagSubscription = (id: string, workspaceId: string, plan: string) =>
  dodo(`/subscriptions/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ metadata: { workspace_id: workspaceId, plan } }) });

/** Moves an existing subscription to another plan, charging/crediting the difference now. */
export async function changePlan(subscriptionId: string, plan: PlanId) {
  const productId = productOf(plan);
  if (!productId) throw new Error(`No Dodo product configured for ${plan}`);
  await dodo(`/subscriptions/${encodeURIComponent(subscriptionId)}/change-plan`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity: 1, proration_billing_mode: "prorated_immediately" }),
  });
}

/** Signed Dodo customer-portal link (invoices, payment method, cancellation). */
export async function customerPortalUrl(customerId: string, returnUrl: string) {
  const res = await dodo<{ link: string }>(
    `/customers/${encodeURIComponent(customerId)}/customer-portal/session?return_url=${encodeURIComponent(returnUrl)}`,
    { method: "POST" },
  );
  return res.link;
}

/** Cancels a subscription immediately (used when a workspace is deleted). */
export async function cancelSubscription(subscriptionId: string) {
  await dodo(`/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
}

/**
 * Subscription statuses that keep paid access:
 * - active
 * - past_due: renewal failed, inside Dodo's grace period
 * Everything else (pending, on_hold, paused, cancelled, failed, expired) uses the free trial limits.
 * Cancellation from the customer portal is normally "cancel at next billing date", which keeps
 * the status active until the period ends, so customers keep what they paid for.
 */
export const keepsAccess = (status: string) => status === "active" || status === "past_due";

/** Workspace fields for a subscription's current state. */
export function workspaceBillingState(sub: DodoSubscription) {
  const paidPlan = planForProduct(sub.product_id);
  const terminal = sub.status === "expired" || sub.status === "failed" || sub.status === "cancelled";
  return {
    plan: keepsAccess(sub.status) && paidPlan ? paidPlan : "trial",
    subscriptionStatus: sub.status,
    billingSubscriptionId: terminal ? null : sub.subscription_id,
    billingCustomerId: sub.customer.customer_id,
  };
}
