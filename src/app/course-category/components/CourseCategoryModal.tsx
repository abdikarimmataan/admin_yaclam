"use client";

import { FolderOpen, X } from "lucide-react";
import { useEffect } from "react";
import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { CourseCategoryForm } from "@/app/course-category/components/CourseCategoryForm";

type CourseCategoryModalProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  fields: FormField[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (key: string, value: unknown) => void;
};

export function CourseCategoryModal({
  open,
  title,
  submitLabel,
  form,
  formErrors,
  fields,
  submitting,
  onClose,
  onSubmit,
  onChange,
}: CourseCategoryModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm sm:p-10"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <CourseCategoryForm
            fields={fields}
            form={form}
            formErrors={formErrors}
            onChange={onChange}
          />
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            <FolderOpen className="h-4 w-4" />
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
