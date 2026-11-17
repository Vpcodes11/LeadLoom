import "server-only";
import { db } from "./db";
import { planOf } from "./plans";

export async function piecesUsedThisMonth(workspaceId: string) {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  return db.usageEvent.count({ where: { workspaceId, kind: "draft", createdAt: { gte: start } } });
}

export async function assertCanDraft(workspaceId: string, plan: string) {
  const used = await piecesUsedThisMonth(workspaceId);
  const limit = planOf(plan).piecesPerMonth;
  if (used >= limit) throw new Error(`You've used all ${limit} pieces on your plan this month. Upgrade on the Billing page.`);
}

export async function assertCanAddBrand(workspaceId: string, plan: string) {
  const n = await db.brand.count({ where: { workspaceId } });
  const limit = planOf(plan).brands;
  if (n >= limit) throw new Error(`Your plan allows ${limit} brand${limit > 1 ? "s" : ""}. Upgrade on the Billing page.`);
}
