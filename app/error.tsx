"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600">The error has been logged. Try again, and if it keeps happening, contact support{error.digest ? ` with code ${error.digest}` : ""}.</p>
        <button onClick={reset} className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 cursor-pointer">Try again</button>
      </div>
    </div>
  );
}
