"use client";

import { User, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export type StudentFormState = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  status: boolean;
  approve: boolean;
};

type StudentModalProps = {
  open: boolean;
  title: string;
  editing: boolean;
  form: StudentFormState;
  formErrors: Record<string, string>;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (patch: Partial<StudentFormState>) => void;
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-700">
        {label}
        {required && " *"}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function StudentModal({
  open,
  title,
  editing,
  form,
  formErrors,
  submitting,
  onClose,
  onSubmit,
  onChange,
}: StudentModalProps) {
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
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
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

        <div className="space-y-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" required error={formErrors.full_name}>
              <input
                value={form.full_name}
                onChange={(e) => onChange({ full_name: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Email" required error={formErrors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => onChange({ email: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          {!editing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone">
                  <input
                    value={form.phone}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Password" required error={formErrors.password}>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => onChange({ password: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <p className="text-xs text-slate-500">
                Upper, lower, number & special character required
              </p>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => onChange({ phone: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <div className="flex flex-col justify-end gap-2 pb-1">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.status}
                    onChange={(e) => onChange({ status: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
                  />
                  Active
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.approve}
                    onChange={(e) => onChange({ approve: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
                  />
                  Approved
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            <User className="h-4 w-4" />
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
