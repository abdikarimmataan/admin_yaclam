"use client";

import { Building2, Globe2, MapPin } from "lucide-react";
import {
  countryLabelFromUniversity,
  getUniversityLabel,
  locationLabelFromUniversity,
  type UniversityRecord,
} from "@/app/university/model/university.model";

type ManageUniversityPreviewCardProps = {
  university: UniversityRecord | null;
};

export function ManageUniversityPreviewCard({ university }: ManageUniversityPreviewCardProps) {
  if (!university) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
        <Building2 className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-500">Select a university to preview its details.</p>
      </div>
    );
  }

  const name = getUniversityLabel(university);
  const country = countryLabelFromUniversity(university);
  const location = locationLabelFromUniversity(university);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className="px-4 py-3"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
              Selected university
            </p>
            <p className="text-sm font-bold text-white">{name}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <Globe2 className="h-3.5 w-3.5" /> Country
          </p>
          <p className="text-sm font-medium text-slate-900">{country}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> Location
          </p>
          <p className="text-sm font-medium text-slate-900">{location}</p>
        </div>
      </div>
    </div>
  );
}
