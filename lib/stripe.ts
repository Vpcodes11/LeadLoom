import "server-only";
import Stripe from "stripe";

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);
let _s: Stripe | null = null;
export const stripe = () => (_s ??= new Stripe(process.env.STRIPE_SECRET_KEY!));
