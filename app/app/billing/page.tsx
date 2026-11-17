import { requireUser } from "@/lib/auth";
import { PLANS, planOf, type PlanId } from "@/lib/plans";
import { piecesUsedThisMonth } from "@/lib/usage";
import { stripeEnabled } from "@/lib/stripe";
import { Button, Card, PageHeader } from "@/components/ui";

export default async function Billing({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const sp = await searchParams;
  const { workspace } = await requireUser();
  const current = planOf(workspace.plan);
  const used = await piecesUsedThisMonth(workspace.id);
  const ids: PlanId[] = ["starter", "growth", "agency"];
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Billing" sub={`You're on ${current.name}: ${used}/${current.piecesPerMonth} pieces used this month, up to ${current.brands} brand(s).`}
        actions={workspace.stripeCustomerId && <form action="/api/stripe/portal" method="post"><Button variant="secondary">Manage subscription</Button></form>} />
      {sp.success && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Thanks! Your plan will update in a few seconds.</p>}
      {(sp.error || !stripeEnabled()) && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Stripe isn&apos;t configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_* in .env to enable checkout.</p>}
      <div className="grid gap-5 md:grid-cols-3">
        {ids.map((id) => {
          const p = PLANS[id];
          const isCurrent = workspace.plan === id;
          return (
            <Card key={id} className={isCurrent ? "ring-2 ring-brand-500" : ""}>
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-3xl font-bold mt-2">${p.price}<span className="text-base font-normal text-slate-500">/mo</span></p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                <li>{p.piecesPerMonth} pieces / month</li>
                <li>{p.brands} brand{p.brands > 1 ? "s" : ""}</li>
                <li>{p.whiteLabel ? "White-label client portal" : "Client review links"}</li>
              </ul>
              <form action="/api/stripe/checkout" method="post" className="mt-5">
                <input type="hidden" name="plan" value={id} />
                <Button className="w-full" disabled={isCurrent} variant={isCurrent ? "secondary" : "primary"}>{isCurrent ? "Current plan" : `Choose ${p.name}`}</Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
