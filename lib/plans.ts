export type PlanId = "trial" | "starter" | "growth" | "agency";

export const PLANS: Record<PlanId, {
  name: string;
  price: number;
  brands: number;
  piecesPerMonth: number;
  whiteLabel: boolean;
  blurb: string;
  priceEnv?: string;
}> = {
  trial: { name: "Trial", price: 0, brands: 1, piecesPerMonth: 5, whiteLabel: false, blurb: "Try one funnel" },
  starter: { name: "Starter", price: 49, brands: 1, piecesPerMonth: 12, whiteLabel: false, blurb: "For one business", priceEnv: "STRIPE_PRICE_STARTER" },
  growth: { name: "Growth", price: 149, brands: 5, piecesPerMonth: 40, whiteLabel: false, blurb: "For growing teams", priceEnv: "STRIPE_PRICE_GROWTH" },
  agency: { name: "Agency", price: 399, brands: 50, piecesPerMonth: 150, whiteLabel: true, blurb: "Client portal + white-label", priceEnv: "STRIPE_PRICE_AGENCY" },
};

export function planOf(id: string) {
  return PLANS[(id as PlanId)] ?? PLANS.trial;
}
