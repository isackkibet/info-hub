import type { ReactNode } from "react";

export function PreviewNotice({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-gold-50 px-4 py-2.5 text-sm text-gold-800">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
      <p>{children}</p>
    </div>
  );
}
