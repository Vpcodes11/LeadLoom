import type { ReactNode } from "react";
import { Logo } from "./logo";
import { Card } from "./ui";

export function AuthShell({ title, sub, children, footer }: { title: string; sub?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card>
          <h1 className="mb-1 text-xl font-semibold">{title}</h1>
          {sub && <p className="mb-5 text-sm text-slate-600">{sub}</p>}
          {!sub && <div className="mb-4" />}
          {children}
        </Card>
        {footer && <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </div>
  );
}
