export type PlanId = "trial" | "starter" | "growth" | "agency";

export const PLANS: Record<PlanId, {
  name: string;
  price: number;
  brands: number;
  piecesPerMonth: number;
  seats: number;
  whiteLabel: boolean;
  blurb: string;
  priceEnv?: string;
}> = {
  trial: { name: "Free trial", price: 0, brands: 1, piecesPerMonth: 5, seats: 2, whiteLabel: false, blurb: "5 pieces to try it, no card needed" },
  starter: { name: "Starter", price: 49, brands: 1, piecesPerMonth: 12, seats: 2, whiteLabel: false, blurb: "For one business", priceEnv: "STRIPE_PRICE_STARTER" },
  growth: { name: "Growth", price: 149, brands: 5, piecesPerMonth: 40, seats: 5, whiteLabel: false, blurb: "For growing teams", priceEnv: "STRIPE_PRICE_GROWTH" },
  agency: { name: "Agency", price: 399, brands: 50, piecesPerMonth: 150, seats: 15, whiteLabel: true, blurb: "Client portal + white-label", priceEnv: "STRIPE_PRICE_AGENCY" },
};

export function planOf(id: string) {
  return PLANS[(id as PlanId)] ?? PLANS.trial;
}

export type AiKind = "draft" | "revision" | "plan" | "voice";

/** The free trial is one-off (lifetime caps); paid plans reset monthly. */
export const isTrial = (planId: string) => !(planId in PLANS) || planId === "trial";

/** Monthly caps per AI action. Drafts are the headline number; the rest stop free-AI abuse. */
export function aiLimits(planId: string): Record<AiKind, number> {
  const p = planOf(planId);
  return {
    draft: p.piecesPerMonth,
    revision: p.piecesPerMonth * 3,
    plan: Math.max(3, Math.ceil(p.piecesPerMonth / 3)),
    voice: Math.max(3, p.brands * 3),
  };
}
