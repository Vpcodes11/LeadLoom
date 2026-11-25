"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <h1 className="font-serif text-[40px]">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600">The error has been logged. Try again, and if it keeps happening, contact support{error.digest ? ` with code ${error.digest}` : ""}.</p>
        <button onClick={reset} className="mt-5 rounded-full bg-ink px-5 py-2 text-sm font-medium text-[#fffaf0] hover:bg-black cursor-pointer">Try again</button>
      </div>
    </div>
  );
}
