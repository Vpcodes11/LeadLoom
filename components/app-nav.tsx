"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

/** Sidebar links; the current page sits on a white pill, like a sheet of paper on the desk. */
export function AppNav({ links, className }: { links: { href: string; label: string }[]; className?: string }) {
  const path = usePathname();
  const active = (href: string) => (href === "/app" ? path === "/app" : path === href || path.startsWith(`${href}/`));
  return (
    <nav className={className}>
      {links.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          aria-current={active(n.href) ? "page" : undefined}
          className={cx(
            "truncate whitespace-nowrap rounded-full px-3 py-1.5 transition",
            active(n.href) ? "bg-white text-ink shadow-[0_6px_16px_-10px_rgba(28,26,23,.45)]" : "text-slate-600 hover:bg-white/60 hover:text-ink",
          )}
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
