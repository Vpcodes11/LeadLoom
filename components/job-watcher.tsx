"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** While AI jobs are running, refresh the server-rendered page every few seconds. */
export function JobWatcher({ active, intervalMs = 4000 }: { active: boolean; intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(t);
  }, [active, intervalMs, router]);
  return null;
}
