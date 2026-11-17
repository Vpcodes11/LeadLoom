import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold text-lg tracking-tight">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white text-sm">L</span>
      Leadloom
    </Link>
  );
}
