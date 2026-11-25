import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

const btn = {
  primary: "bg-ink text-[#fffaf0] shadow-[0_8px_20px_-10px_rgba(28,26,23,.6)] hover:-translate-y-px hover:bg-black disabled:opacity-60 disabled:hover:translate-y-0",
  secondary: "bg-white/80 text-slate-800 border border-slate-300 hover:bg-white hover:border-slate-400 disabled:opacity-60",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
};
export type BtnVariant = keyof typeof btn;
export const btnClass = (v: BtnVariant = "primary", size: "sm" | "md" = "md") =>
  cx("inline-flex items-center justify-center gap-2 rounded-full font-medium transition cursor-pointer", size === "sm" ? "px-3.5 py-1.5 text-sm" : "px-5 py-2 text-sm", btn[v]);

export function Button({ variant = "primary", size = "md", className, ...p }: ComponentProps<"button"> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return <button {...p} className={cx(btnClass(variant, size), className)} />;
}

export function LinkButton({ variant = "primary", size = "md", className, ...p }: ComponentProps<typeof Link> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return <Link {...p} className={cx(btnClass(variant, size), className)} />;
}

export function Card({ className, ...p }: ComponentProps<"div">) {
  return <div {...p} className={cx("rounded-2xl border border-[rgba(28,26,23,0.1)] bg-white p-5 shadow-[0_1px_0_rgba(255,255,255,.8)_inset,0_18px_40px_-30px_rgba(28,26,23,.35)]", className)} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint && <span className="block text-xs text-slate-500 mt-0.5">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100";
export function Input(p: ComponentProps<"input">) {
  return <input {...p} className={cx(inputCls, p.className)} />;
}
export function Textarea(p: ComponentProps<"textarea">) {
  return <textarea {...p} className={cx(inputCls, p.className)} />;
}
export function Select(p: ComponentProps<"select">) {
  return <select {...p} className={cx(inputCls, p.className)} />;
}

const badgeColors: Record<string, string> = {
  requested: "bg-violet-50 text-violet-700",
  planned: "bg-slate-100 text-slate-700",
  draft: "bg-[#e8eef6] text-[#35507a]",
  in_review: "bg-amber-50 text-amber-800",
  changes_requested: "bg-red-50 text-red-700",
  approved: "bg-emerald-50 text-emerald-700",
  delivered: "bg-emerald-600 text-white",
  awareness: "bg-[#e8eef6] text-[#35507a]",
  consideration: "bg-brand-50 text-brand-700",
  decision: "bg-emerald-50 text-emerald-700",
};
export function Badge({ tone, children }: { tone?: string; children: ReactNode }) {
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", badgeColors[tone ?? ""] ?? "bg-slate-100 text-slate-700")}>{children}</span>;
}

export function PageHeader({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="font-serif text-[34px] leading-tight sm:text-[40px]">{title}</h1>
        {sub && <p className="text-slate-600 mt-1 text-sm">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white/40 p-8 text-center text-sm text-slate-500">{children}</div>;
}
