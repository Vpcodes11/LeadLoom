import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await requireUser();
  const item = await db.contentItem.findFirst({ where: { id, brand: { workspaceId: workspace.id } } });
  if (!item?.body) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "content";
  return new NextResponse(item.body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": `attachment; filename="${slug}.md"` },
  });
}
