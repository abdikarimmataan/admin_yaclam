"use client";

import { FolderOpen, X } from "lucide-react";
import { useEffect } from "react";
import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { UniversityForm } from "@/app/university/components/UniversityForm";
import type { Select2Option } from "@/shared/components/Select2";

type Props = {
  open: boolean;
  title: string;
  submitLabel: string;
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  fields: FormField[];
  locationOptions: Select2Option[];
  categoryOptions: Select2Option[];
  languageOptions: Select2Option[];
  optionsLoading?: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (key: string, value: unknown) => void;
};

export function UniversityModal(props: Props) {
  const {
    open,
    title,
    submitLabel,
    form,
    formErrors,
    fields,
    locationOptions,
    categoryOptions,
    languageOptions,
    optionsLoading,
    submitting,
    onClose,
    onSubmit,
    onChange,
  } = props;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">
          <UniversityForm
            fields={fields}
            form={form}
            formErrors={formErrors}
            locationOptions={locationOptions}
            categoryOptions={categoryOptions}
            languageOptions={languageOptions}
            optionsLoading={optionsLoading}
            onChange={onChange}
          />
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
