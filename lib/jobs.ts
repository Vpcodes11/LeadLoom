import "server-only";
import { after } from "next/server";
import { db } from "./db";
import { writeDraft, reviseDraft } from "./ai";
import { brandContext, parseVoice } from "./brand";
import { runQa } from "./qa";

export const ACTIVE = ["queued", "running"];
const CONCURRENCY = 3;
const STUCK_MS = 10 * 60_000;

export function qaFor(item: { format: string; keyword: string | null; cta: string | null }, body: string, brand: { voiceProfile: string | null; proofPoints: string | null }) {
  return JSON.stringify(runQa({ body, format: item.format, keyword: item.keyword, cta: item.cta, bannedWords: parseVoice(brand.voiceProfile)?.bannedWords, proofPoints: brand.proofPoints }));
}

/** Queue AI jobs and start them once the response has been sent. Usage is recorded now (refunded if a job fails). */
export async function enqueue(workspaceId: string, jobs: { itemId: string; kind: "draft" | "revision"; input?: string }[]) {
  if (jobs.length === 0) return [];
  const created = await db.$transaction(jobs.flatMap((j) => [
    db.job.create({ data: { workspaceId, itemId: j.itemId, kind: j.kind, input: j.input } }),
    db.usageEvent.create({ data: { workspaceId, kind: j.kind } }),
  ]));
  const ids = created.filter((_, i) => i % 2 === 0).map((j) => (j as { id: string }).id);
  after(() => runMany(ids));
  return ids;
}

export async function runMany(ids: string[]) {
  const queue = [...ids];
  const worker = async () => { for (let id = queue.shift(); id; id = queue.shift()) await runJob(id); };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
}

export async function runJob(id: string) {
  // Atomic claim: only one runner can move a job from queued to running.
  const claimed = await db.job.updateMany({ where: { id, status: "queued" }, data: { status: "running", startedAt: new Date(), attempts: { increment: 1 } } });
  if (claimed.count === 0) return;
  const job = await db.job.findUniqueOrThrow({ where: { id }, include: { item: { include: { brand: true, funnel: true } } } });
  const { item } = job;
  try {
    const brief = { ...item, funnelGoal: item.funnel?.goal };
    const ctx = brandContext(item.brand);
    let body: string;
    let reason: string;
    if (job.kind === "revision") {
      if (!item.body) throw new Error("There is no draft to revise.");
      body = await reviseDraft(ctx, brief, item.body, job.input ?? "");
      reason = (job.input ?? "AI revision").slice(0, 300);
    } else {
      body = await writeDraft(ctx, brief);
      reason = item.body ? "Fresh draft" : "First draft";
    }
    // Re-read the version so a manual edit made while the AI was writing isn't lost from history.
    const fresh = await db.contentItem.findUniqueOrThrow({ where: { id: item.id }, select: { version: true, status: true } });
    const version = fresh.version + 1;
    const status = ["requested", "planned", "changes_requested"].includes(fresh.status) ? "draft" : fresh.status;
    await db.$transaction([
      db.contentItem.update({ where: { id: item.id }, data: { body, version, status, qaReport: qaFor(item, body, item.brand) } }),
      db.revision.create({ data: { itemId: item.id, version, body, reason } }),
      db.job.update({ where: { id }, data: { status: "done", finishedAt: new Date() } }),
    ]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`job ${id} failed:`, e);
    const refund = await db.usageEvent.findFirst({ where: { workspaceId: job.workspaceId, kind: job.kind }, orderBy: { createdAt: "desc" } });
    await db.$transaction([
      db.job.update({ where: { id }, data: { status: "failed", error: msg.slice(0, 500), finishedAt: new Date() } }),
      ...(refund ? [db.usageEvent.delete({ where: { id: refund.id } })] : []),
    ]);
  }
}

/** Safety net for crashed or timed-out runners (called by cron). */
export async function recoverJobs(limit = 10) {
  await db.job.updateMany({
    where: { status: "running", startedAt: { lt: new Date(Date.now() - STUCK_MS) }, attempts: { lt: 3 } },
    data: { status: "queued" },
  });
  await db.job.updateMany({
    where: { status: "running", startedAt: { lt: new Date(Date.now() - STUCK_MS) }, attempts: { gte: 3 } },
    data: { status: "failed", error: "Timed out 3 times", finishedAt: new Date() },
  });
  const pending = await db.job.findMany({ where: { status: "queued", createdAt: { lt: new Date(Date.now() - 60_000) } }, orderBy: { createdAt: "asc" }, take: limit, select: { id: true } });
  await runMany(pending.map((j) => j.id));
  return pending.length;
}
