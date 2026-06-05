"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

const PLACEHOLDERS: Record<string, string> = {
  name: "e.g. Data Science",
  description: "e.g. Data analysis and machine learning tracks.",
  icon: "e.g. chart-bar",
};

type FieldFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
};

function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const inputClass = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
    error ? "border-red-400" : "border-slate-300"
  }`;

  if (field.type === "boolean") {
    return (
      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <textarea
          rows={3}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDERS[field.key]}
          className={inputClass}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={field.type === "number" ? "number" : "text"}
        value={field.type === "number" ? Number(value ?? 0) : String(value ?? "")}
        onChange={(e) =>
          onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
        }
        placeholder={PLACEHOLDERS[field.key]}
        className={inputClass}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function FieldForm({ fields, form, formErrors, onChange }: FieldFormProps) {
  return (
    <div className="space-y-4">
      {formErrors._form && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formErrors._form}</p>
      )}
      {fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={form[field.key]}
          error={formErrors[field.key]}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
    </div>
  );
}
