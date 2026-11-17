import Link from "next/link";
import type { ContentItem } from "@prisma/client";
import { Badge, Empty } from "./ui";
import { formatLabel, statusLabel } from "@/lib/formats";

export function ContentTable({ items, showQa = true }: { items: ContentItem[]; showQa?: boolean }) {
  if (items.length === 0) return <Empty>No content yet.</Empty>;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr><th className="px-4 py-2">Title</th><th className="px-4 py-2">Format</th><th className="px-4 py-2">Stage</th><th className="px-4 py-2">Status</th>{showQa && <th className="px-4 py-2">QA</th>}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((i) => {
            const score = i.qaReport ? (JSON.parse(i.qaReport).score as number) : null;
            return (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5"><Link href={`/app/content/${i.id}`} className="font-medium hover:text-brand-600">{i.title}</Link></td>
                <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatLabel(i.format)}</td>
                <td className="px-4 py-2.5"><Badge tone={i.stage}>{i.stage}</Badge></td>
                <td className="px-4 py-2.5"><Badge tone={i.status}>{statusLabel(i.status)}</Badge></td>
                {showQa && <td className="px-4 py-2.5">{score === null ? <span className="text-slate-400">—</span> : <span className={score >= 80 ? "text-emerald-700" : score >= 60 ? "text-amber-700" : "text-red-600"}>{score}</span>}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
