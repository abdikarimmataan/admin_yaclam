"use client";

import { LucideIconByName } from "@/shared/components/LucideIconByName";

export function IconNameCell({ name }: { name?: string | null }) {
  if (!name) return <>—</>;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50">
        <LucideIconByName name={String(name)} className="h-4 w-4 text-slate-700" />
      </span>
      <span>{String(name)}</span>
    </span>
  );
}
