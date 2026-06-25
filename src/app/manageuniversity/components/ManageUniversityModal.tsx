"use client";

import { FolderOpen, X } from "lucide-react";
import { useEffect } from "react";
import { ManageUniversityForm } from "@/app/manageuniversity/components/ManageUniversityForm";
import { ManageUniversityPreviewCard } from "@/app/manageuniversity/components/ManageUniversityPreviewCard";
import type { UniversityRecord } from "@/app/university/model/university.model";
import type { Select2Option } from "@/shared/components/Select2";

type ManageUniversityModalProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  editing: boolean;
  previewUniversity: UniversityRecord | null;
  universityOptions: Select2Option[];
  studyAreaOptions: Select2Option[];
  disciplineOptions: Select2Option[];
  degreeLevelOptions: Select2Option[];
  languageOptions: Select2Option[];
  optionsLoading?: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (key: string, value: unknown) => void;
};

export function ManageUniversityModal({
  open,
  title,
  submitLabel,
  form,
  formErrors,
  editing,
  previewUniversity,
  universityOptions,
  studyAreaOptions,
  disciplineOptions,
  degreeLevelOptions,
  languageOptions,
  optionsLoading = false,
  submitting,
  onClose,
  onSubmit,
  onChange,
}: ManageUniversityModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-4">
          <ManageUniversityForm
            form={form}
            formErrors={formErrors}
            editing={editing}
            universityOptions={universityOptions}
            studyAreaOptions={studyAreaOptions}
            disciplineOptions={disciplineOptions}
            degreeLevelOptions={degreeLevelOptions}
            languageOptions={languageOptions}
            optionsLoading={optionsLoading}
            onChange={onChange}
          />
          <ManageUniversityPreviewCard university={previewUniversity} />
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <FolderOpen className="h-4 w-4" />
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
