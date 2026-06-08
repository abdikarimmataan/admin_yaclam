"use client";

import type { InstructorRecord } from "@/app/instructors/model/instructor.model";
import {
  getInstructorLabel,
  getInstructorRoleName,
} from "@/app/instructors/model/instructor.model";
import { resolveAssetUrl } from "@/shared/utils/asset-url";

type InstructorTokenInstructorPanelProps = {
  instructor: InstructorRecord | null;
  loading?: boolean;
};

export function InstructorTokenInstructorPanel({
  instructor,
  loading = false,
}: InstructorTokenInstructorPanelProps) {
  if (loading) {
    return (
      <p className="text-sm text-slate-500">Loading your instructor profile…</p>
    );
  }

  if (!instructor) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Could not load instructor from your session. Please sign in again.
      </p>
    );
  }

  const photoUrl = resolveAssetUrl(String(instructor.photo ?? ""));

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Instructor is assigned automatically from your login account.
      </p>
      <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={getInstructorLabel(instructor)}
            className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
            {getInstructorLabel(instructor).slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 space-y-1 text-sm">
          <p className="font-semibold text-slate-900">{getInstructorLabel(instructor)}</p>
          <p className="truncate text-slate-600">{String(instructor.email ?? "—")}</p>
          <p className="text-slate-600">{String(instructor.phone ?? "—")}</p>
          <p className="text-xs text-slate-500">{getInstructorRoleName(instructor)}</p>
        </div>
      </div>
    </div>
  );
}
