"use client";

import type { ReactNode } from "react";
import type { Select2Option } from "@/shared/components/Select2";
import { Select2 } from "@/shared/components/Select2";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10";

type CourseFormProps = {
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  fieldOptions: Select2Option[];
  onChange: (key: string, value: unknown) => void;
};

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

export function CourseForm({
  form,
  formErrors,
  fieldOptions,
  onChange,
}: CourseFormProps) {
  return (
    <div className="space-y-4">
      {formErrors._form && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{formErrors._form}</p>
      )}

      <Field label="Title" required error={formErrors.title}>
        <input
          value={String(form.title ?? "")}
          onChange={(e) => onChange("title", e.target.value)}
          className={inputClass}
          placeholder="e.g. Introduction to React"
        />
      </Field>

      <Field label="Field" required error={formErrors.fieldId}>
        <Select2
          options={fieldOptions}
          value={String(form.fieldId ?? "")}
          onChange={(v) => onChange("fieldId", v)}
          placeholder="Select a field…"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Short description">
          <input
            value={String(form.shortDescription ?? "")}
            onChange={(e) => onChange("shortDescription", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Category">
          <input
            value={String(form.category ?? "")}
            onChange={(e) => onChange("category", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={3}
          value={String(form.description ?? "")}
          onChange={(e) => onChange("description", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Instructor">
          <input
            value={String(form.instructorName ?? "")}
            onChange={(e) => onChange("instructorName", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Thumbnail URL">
          <input
            value={String(form.thumbnail ?? "")}
            onChange={(e) => onChange("thumbnail", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price">
          <input
            type="number"
            min={0}
            value={Number(form.price ?? 0)}
            onChange={(e) => onChange("price", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Original price">
          <input
            type="number"
            min={0}
            value={Number(form.originalPrice ?? 0)}
            onChange={(e) => onChange("originalPrice", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Sort order">
          <input
            type="number"
            value={Number(form.sortOrder ?? 0)}
            onChange={(e) => onChange("sortOrder", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Duration (hours)">
          <input
            type="number"
            min={0}
            value={Number(form.durationHours ?? 0)}
            onChange={(e) => onChange("durationHours", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4">
        {(
          [
            ["isFree", "Free"],
            ["isFeatured", "Featured"],
            ["isPublished", "Published"],
            ["isVisible", "Visible"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700"
          >
            <input
              type="checkbox"
              checked={!!form[key]}
              onChange={(e) => onChange(key, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
