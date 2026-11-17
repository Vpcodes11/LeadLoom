"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { createSession, destroySession, requireUser } from "./auth";
import { extractVoice, planFunnel, writeDraft, reviseDraft } from "./ai";
import { brandContext, parseVoice } from "./brand";
import { runQa } from "./qa";
import { assertCanAddBrand, assertCanDraft } from "./usage";

export type ActionState = { error?: string; ok?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

// ---------- Auth ----------

export async function signup(_: ActionState, f: FormData): Promise<ActionState> {
  const email = str(f, "email").toLowerCase();
  const name = str(f, "name");
  const password = str(f, "password");
  const company = str(f, "company") || `${name}'s workspace`;
  if (!email.includes("@") || password.length < 8 || !name) return { error: "Enter your name, a valid email and a password of 8+ characters." };
  if (await db.user.findUnique({ where: { email } })) return { error: "An account with this email already exists." };
  const user = await db.user.create({
    data: {
      email, name, passwordHash: await bcrypt.hash(password, 10),
      memberships: { create: { role: "owner", workspace: { create: { name: company } } } },
    },
  });
  await createSession(user.id);
  redirect("/app");
}

export async function login(_: ActionState, f: FormData): Promise<ActionState> {
  const user = await db.user.findUnique({ where: { email: str(f, "email").toLowerCase() } });
  if (!user || !(await bcrypt.compare(str(f, "password"), user.passwordHash))) return { error: "Wrong email or password." };
  await createSession(user.id);
  redirect("/app");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

// ---------- Ownership helpers ----------

async function ownBrand(brandId: string) {
  const { workspace } = await requireUser();
  const brand = await db.brand.findFirst({ where: { id: brandId, workspaceId: workspace.id } });
  if (!brand) throw new Error("Brand not found");
  return { brand, workspace };
}

async function ownItem(itemId: string) {
  const { workspace, user } = await requireUser();
  const item = await db.contentItem.findFirst({ where: { id: itemId, brand: { workspaceId: workspace.id } }, include: { brand: true, funnel: true } });
  if (!item) throw new Error("Content not found");
  return { item, workspace, user };
}

// ---------- Brands ----------

function brandFields(f: FormData) {
  return {
    name: str(f, "name"),
    website: str(f, "website") || null,
    industry: str(f, "industry") || null,
    audience: str(f, "audience"),
    offer: str(f, "offer"),
    differentiators: str(f, "differentiators") || null,
    proofPoints: str(f, "proofPoints") || null,
    competitors: str(f, "competitors") || null,
    voiceSamples: str(f, "voiceSamples") || null,
  };
}

export async function createBrand(_: ActionState, f: FormData): Promise<ActionState> {
  const { workspace } = await requireUser();
  const data = brandFields(f);
  if (!data.name || !data.audience || !data.offer) return { error: "Name, ideal customer and offer are required." };
  let id: string;
  try {
    await assertCanAddBrand(workspace.id, workspace.plan);
    const brand = await db.brand.create({ data: { ...data, workspaceId: workspace.id } });
    id = brand.id;
    if (data.voiceSamples && data.voiceSamples.length > 200) {
      const voice = await extractVoice(brandContext(brand), data.voiceSamples);
      await db.brand.update({ where: { id }, data: { voiceProfile: JSON.stringify(voice) } });
    }
  } catch (e) {
    return { error: errMsg(e) };
  }
  redirect(`/app/brands/${id}`);
}

export async function updateBrand(brandId: string, _: ActionState, f: FormData): Promise<ActionState> {
  try {
    await ownBrand(brandId);
    const data = brandFields(f);
    if (!data.name || !data.audience || !data.offer) return { error: "Name, ideal customer and offer are required." };
    await db.brand.update({ where: { id: brandId }, data });
    revalidatePath(`/app/brands/${brandId}`);
    return { ok: "Saved" };
  } catch (e) {
    return { error: errMsg(e) };
  }
}

export async function rebuildVoice(brandId: string, _: ActionState): Promise<ActionState> {
  try {
    const { brand, workspace } = await ownBrand(brandId);
    if (!brand.voiceSamples || brand.voiceSamples.length < 200) return { error: "Paste at least ~200 characters of existing writing in Voice samples first." };
    const voice = await extractVoice(brandContext(brand), brand.voiceSamples);
    await db.brand.update({ where: { id: brandId }, data: { voiceProfile: JSON.stringify(voice) } });
    await db.usageEvent.create({ data: { workspaceId: workspace.id, kind: "voice" } });
    revalidatePath(`/app/brands/${brandId}`);
    return { ok: "Voice profile updated" };
  } catch (e) {
    return { error: errMsg(e) };
  }
}

export async function deleteBrand(brandId: string) {
  await ownBrand(brandId);
  await db.brand.delete({ where: { id: brandId } });
  redirect("/app");
}

// ---------- Funnels ----------

export async function createFunnel(brandId: string, _: ActionState, f: FormData): Promise<ActionState> {
  const goal = str(f, "goal");
  const pieces = Math.min(15, Math.max(3, Number(str(f, "pieces")) || 7));
  if (!goal) return { error: "Describe what the funnel should achieve." };
  let funnelId: string;
  try {
    const { brand, workspace } = await ownBrand(brandId);
    const plan = await planFunnel(brandContext(brand), goal, pieces);
    const funnel = await db.funnel.create({
      data: {
        brandId, goal, strategy: plan.strategy,
        name: str(f, "name") || `Funnel: ${goal}`,
        items: {
          create: plan.items.map((it, i) => ({
            brandId, position: i, title: it.title, format: it.format, stage: it.stage,
            keyword: it.keyword || null, angle: it.angle, cta: it.cta, status: "planned",
          })),
        },
      },
    });
    await db.usageEvent.create({ data: { workspaceId: workspace.id, kind: "plan" } });
    funnelId = funnel.id;
  } catch (e) {
    return { error: errMsg(e) };
  }
  redirect(`/app/funnels/${funnelId}`);
}

// ---------- Content ----------

export async function requestContent(brandId: string, _: ActionState, f: FormData): Promise<ActionState> {
  const title = str(f, "title");
  if (!title) return { error: "Give the piece a working title." };
  let id: string;
  try {
    await ownBrand(brandId);
    const item = await db.contentItem.create({
      data: {
        brandId, title, format: str(f, "format") || "blog", stage: str(f, "stage") || "awareness",
        keyword: str(f, "keyword") || null, angle: str(f, "angle") || null, cta: str(f, "cta") || null,
        notes: str(f, "notes") || null, status: "requested",
        dueDate: str(f, "dueDate") ? new Date(str(f, "dueDate")) : null,
      },
    });
    id = item.id;
  } catch (e) {
    return { error: errMsg(e) };
  }
  redirect(`/app/content/${id}`);
}

function qaFor(item: { format: string; keyword: string | null; cta: string | null }, body: string, voiceJson: string | null) {
  return JSON.stringify(runQa({ body, format: item.format, keyword: item.keyword, cta: item.cta, bannedWords: parseVoice(voiceJson)?.bannedWords }));
}

export async function generateDraft(itemId: string, _: ActionState): Promise<ActionState> {
  try {
    const { item, workspace } = await ownItem(itemId);
    await assertCanDraft(workspace.id, workspace.plan);
    const body = await writeDraft(brandContext(item.brand), { ...item, funnelGoal: item.funnel?.goal });
    const version = item.version + 1;
    await db.$transaction([
      db.contentItem.update({ where: { id: itemId }, data: { body, version, status: "draft", qaReport: qaFor(item, body, item.brand.voiceProfile) } }),
      db.revision.create({ data: { itemId, version, body, reason: "First draft" } }),
      db.usageEvent.create({ data: { workspaceId: workspace.id, kind: "draft" } }),
    ]);
    revalidatePath(`/app/content/${itemId}`);
    return { ok: "Draft ready" };
  } catch (e) {
    return { error: errMsg(e) };
  }
}

/** Draft every planned piece in a funnel, one after another. */
export async function generateFunnelDrafts(funnelId: string, _: ActionState): Promise<ActionState> {
  try {
    const { workspace } = await requireUser();
    const funnel = await db.funnel.findFirst({ where: { id: funnelId, brand: { workspaceId: workspace.id } }, include: { items: true } });
    if (!funnel) return { error: "Funnel not found" };
    const todo = funnel.items.filter((i) => !i.body).sort((a, b) => a.position - b.position);
    if (todo.length === 0) return { ok: "Every piece already has a draft." };
    let done = 0;
    for (const it of todo) {
      const r = await generateDraft(it.id, undefined);
      if (r?.error) return { error: `Drafted ${done} of ${todo.length}. Stopped: ${r.error}` };
      done++;
    }
    revalidatePath(`/app/funnels/${funnelId}`);
    return { ok: `Drafted ${done} piece${done === 1 ? "" : "s"}` };
  } catch (e) {
    return { error: errMsg(e) };
  }
}

export async function saveBody(itemId: string, _: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { item } = await ownItem(itemId);
    const body = String(f.get("body") ?? "");
    const version = item.version + 1;
    await db.$transaction([
      db.contentItem.update({ where: { id: itemId }, data: { body, version, status: item.status === "requested" || item.status === "planned" ? "draft" : item.status, qaReport: qaFor(item, body, item.brand.voiceProfile) } }),
      db.revision.create({ data: { itemId, version, body, reason: "Manual edit" } }),
    ]);
    revalidatePath(`/app/content/${itemId}`);
    return { ok: "Saved" };
  } catch (e) {
    return { error: errMsg(e) };
  }
}

export async function aiRevise(itemId: string, _: ActionState, f: FormData): Promise<ActionState> {
  const feedback = str(f, "feedback");
  if (!feedback) return { error: "Describe what should change." };
  try {
    const { item, workspace, user } = await ownItem(itemId);
    if (!item.body) return { error: "Generate a draft first." };
    const body = await reviseDraft(brandContext(item.brand), { ...item, funnelGoal: item.funnel?.goal }, item.body, feedback);
    const version = item.version + 1;
    await db.$transaction([
      db.contentItem.update({ where: { id: itemId }, data: { body, version, status: item.status === "changes_requested" ? "draft" : item.status, qaReport: qaFor(item, body, item.brand.voiceProfile) } }),
      db.revision.create({ data: { itemId, version, body, reason: feedback.slice(0, 300) } }),
      db.comment.create({ data: { itemId, author: user.name, kind: "comment", body: `AI revision: ${feedback}` } }),
      db.usageEvent.create({ data: { workspaceId: workspace.id, kind: "revision" } }),
    ]);
    revalidatePath(`/app/content/${itemId}`);
    return { ok: "Revised" };
  } catch (e) {
    return { error: errMsg(e) };
  }
}

export async function setStatus(itemId: string, status: string) {
  const { user } = await ownItem(itemId);
  await db.contentItem.update({ where: { id: itemId }, data: { status } });
  const note: Record<string, string> = { in_review: "Sent for client review", approved: "Marked approved", delivered: "Marked delivered" };
  if (note[status]) await db.comment.create({ data: { itemId, author: user.name, kind: "comment", body: note[status] } });
  revalidatePath(`/app/content/${itemId}`);
  revalidatePath("/app/board");
}

export async function restoreRevision(itemId: string, revisionId: string) {
  const { item } = await ownItem(itemId);
  const rev = await db.revision.findFirst({ where: { id: revisionId, itemId } });
  if (!rev) return;
  const version = item.version + 1;
  await db.$transaction([
    db.contentItem.update({ where: { id: itemId }, data: { body: rev.body, version, qaReport: qaFor(item, rev.body, item.brand.voiceProfile) } }),
    db.revision.create({ data: { itemId, version, body: rev.body, reason: `Restored v${rev.version}` } }),
  ]);
  revalidatePath(`/app/content/${itemId}`);
}

export async function addComment(itemId: string, _: ActionState, f: FormData): Promise<ActionState> {
  const body = str(f, "body");
  if (!body) return { error: "Write a comment." };
  try {
    const { user } = await ownItem(itemId);
    await db.comment.create({ data: { itemId, author: user.name, body } });
    revalidatePath(`/app/content/${itemId}`);
    return { ok: "Added" };
  } catch (e) {
    return { error: errMsg(e) };
  }
}

export async function deleteItem(itemId: string) {
  const { item } = await ownItem(itemId);
  await db.contentItem.delete({ where: { id: itemId } });
  redirect(item.funnelId ? `/app/funnels/${item.funnelId}` : `/app/brands/${item.brandId}`);
}

// ---------- Client review portal (no login; access by secret brand token) ----------

export async function clientFeedback(token: string, itemId: string, _: ActionState, f: FormData): Promise<ActionState> {
  const decision = str(f, "decision"); // approve | changes
  const name = str(f, "name") || "Client";
  const body = str(f, "body");
  const item = await db.contentItem.findFirst({ where: { id: itemId, brand: { reviewToken: token }, status: { in: ["in_review", "changes_requested", "approved"] } } });
  if (!item) return { error: "This piece is no longer open for review." };
  if (decision === "changes" && !body) return { error: "Tell us what to change." };
  await db.$transaction([
    db.contentItem.update({ where: { id: itemId }, data: { status: decision === "approve" ? "approved" : "changes_requested" } }),
    db.comment.create({ data: { itemId, author: name, fromClient: true, kind: decision === "approve" ? "approval" : "change_request", body: body || "Approved" } }),
  ]);
  // No revalidatePath: it would refresh the portal and hide the confirmation. App pages are dynamic, so they show the new status on next load.
  return { ok: decision === "approve" ? "Approved — thank you!" : "Feedback sent. We'll revise it." };
}

export async function updateAgencyName(_: ActionState, f: FormData): Promise<ActionState> {
  const { workspace } = await requireUser();
  await db.workspace.update({ where: { id: workspace.id }, data: { agencyName: str(f, "agencyName") || null, name: str(f, "name") || workspace.name } });
  revalidatePath("/app/settings");
  return { ok: "Saved" };
}

