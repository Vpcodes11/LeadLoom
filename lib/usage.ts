import "server-only";
import { db } from "./db";
import { aiLimits, isTrial, planOf, type AiKind } from "./plans";

const monthStart = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
};

/** Usage in the current period: this calendar month on paid plans, lifetime on the free trial. */
export async function usedInPeriod(workspaceId: string, plan: string, kind: AiKind) {
  const since = isTrial(plan) ? new Date(0) : monthStart();
  return db.usageEvent.count({ where: { workspaceId, kind, createdAt: { gte: since } } });
}

export const piecesUsed = (workspaceId: string, plan: string) => usedInPeriod(workspaceId, plan, "draft");

const NOUN: Record<AiKind, string> = { draft: "drafts", revision: "AI revisions", plan: "funnel plans", voice: "voice profile builds" };

/** Throws a user-facing error when the workspace hit its monthly cap for this AI action. `extra` = pieces about to be queued. */
export async function assertAiAllowed(workspaceId: string, plan: string, kind: AiKind, extra = 1) {
  const limit = aiLimits(plan)[kind];
  const used = await usedInPeriod(workspaceId, plan, kind);
  if (used + extra > limit) {
    const left = Math.max(0, limit - used);
    throw new Error(isTrial(plan)
      ? `The free trial includes ${limit} ${NOUN[kind]} (${left} left). Choose a plan on the Billing page to keep going.`
      : `Your ${planOf(plan).name} plan includes ${limit} ${NOUN[kind]} a month (${left} left). Upgrade on the Billing page.`);
  }
}

export async function assertCanAddBrand(workspaceId: string, plan: string) {
  const n = await db.brand.count({ where: { workspaceId } });
  const limit = planOf(plan).brands;
  if (n >= limit) throw new Error(`Your plan allows ${limit} brand${limit > 1 ? "s" : ""}. Upgrade on the Billing page.`);
}
