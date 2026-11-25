import Link from "next/link";

/** The Leadloom wordmark, as on the landing page: serif, with a small amber lamp-glow dot. */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-serif text-[26px] leading-none tracking-tight text-ink" aria-label="Leadloom">
      <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-amber shadow-[0_0_12px_3px_rgba(226,161,60,.55)]" />
      Leadloom
    </Link>
  );
}
