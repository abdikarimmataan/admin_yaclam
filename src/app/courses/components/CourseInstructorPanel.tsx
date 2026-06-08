"use client";

import type { InstructorRecord } from "@/app/instructors/model/instructor.model";
import {
  getInstructorLabel,
  getInstructorRecordId,
  getInstructorRoleName,
} from "@/app/instructors/model/instructor.model";
import { Select2, type Select2Option } from "@/shared/components/Select2";
import { resolveAssetUrl } from "@/shared/utils/asset-url";

type CourseInstructorPanelProps = {
  instructorId: string;
  instructorOptions: Select2Option[];
  instructors: InstructorRecord[];
  loading?: boolean;
  error?: string;
  onInstructorChange: (instructorId: string) => void;
};

export function CourseInstructorPanel({
  instructorId,
  instructorOptions,
  instructors,
  loading = false,
  error,
  onInstructorChange,
}: CourseInstructorPanelProps) {
  const selected =
    instructors.find((item) => getInstructorRecordId(item) === instructorId) ?? null;
  const photoUrl = resolveAssetUrl(String(selected?.photo ?? ""));

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Instructor</label>
        <Select2
          options={instructorOptions}
          value={instructorId}
          onChange={onInstructorChange}
          placeholder="Select an instructor…"
          searchPlaceholder="Search instructors…"
          allowClear
          loading={loading}
          showImages
          error={error}
        />
      </div>

      {selected ? (
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={getInstructorLabel(selected)}
              className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
              {getInstructorLabel(selected).slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 space-y-1 text-sm">
            <p className="font-semibold text-slate-900">{getInstructorLabel(selected)}</p>
            <p className="truncate text-slate-600">{String(selected.email ?? "—")}</p>
            <p className="text-slate-600">{String(selected.phone ?? "—")}</p>
            <p className="text-xs text-slate-500">{getInstructorRoleName(selected)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
