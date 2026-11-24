import { requireUser } from "@/lib/auth";
import { PLANS, planOf, type PlanId } from "@/lib/plans";
import { piecesUsed } from "@/lib/usage";
import { billingEnabled } from "@/lib/billing";
import { Button, Card, PageHeader } from "@/components/ui";

export default async function Billing({ searchParams }: { searchParams: Promise<{ success?: string; changed?: string; error?: string }> }) {
  const sp = await searchParams;
  const { workspace, role } = await requireUser();
  const current = planOf(workspace.plan);
  const used = await piecesUsed(workspace.id, workspace.plan);
  const ids: PlanId[] = ["starter", "growth", "agency"];
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Billing" sub={workspace.plan === "trial" || !(workspace.plan in PLANS) ? `Free trial: ${used} of ${current.piecesPerMonth} trial pieces used. Choose a plan to keep going.` : `You're on ${current.name}: ${used}/${current.piecesPerMonth} pieces used this month, up to ${current.brands} brand(s).`}
        actions={role === "owner" && workspace.billingCustomerId && <form action="/api/billing/portal" method="post"><Button variant="secondary">Manage subscription</Button></form>} />
      {sp.success && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Thanks! Your plan will update in a few seconds.</p>}
      {sp.changed && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Plan change requested. Your new limits apply as soon as the payment goes through.</p>}
      {sp.error === "owner" && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Only the workspace owner can change the plan.</p>}
      {role === "owner" && (sp.error === "billing" || !billingEnabled()) && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Billing isn&apos;t configured yet. Set DODO_PAYMENTS_API_KEY and DODO_PRODUCT_* in .env to enable checkout.</p>}
      {(sp.error === "checkout" || sp.error === "portal") && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">We couldn&apos;t reach the payment provider. Please try again in a minute.</p>}
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
                <li>{p.seats} team seat{p.seats === 1 ? "" : "s"}</li>
                <li>{p.whiteLabel ? "White-label client portal" : "Client review links"}</li>
              </ul>
              <form action="/api/billing/checkout" method="post" className="mt-5">
                <input type="hidden" name="plan" value={id} />
                <Button className="w-full" disabled={isCurrent} variant={isCurrent ? "secondary" : "primary"}>{isCurrent ? "Current plan" : workspace.billingSubscriptionId && workspace.plan !== "trial" ? `Switch to ${p.name}` : `Choose ${p.name}`}</Button>
              </form>
            </Card>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">Prices in USD; local taxes may apply at checkout. Cancel anytime. 7-day money-back guarantee on your first payment. <a href="/refund-policy" className="underline">Refund policy</a></p>
    </div>
  );
}
