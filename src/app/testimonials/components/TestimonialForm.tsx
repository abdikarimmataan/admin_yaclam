"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import {
  TESTIMONIAL_FULL_WIDTH_KEYS,
  deriveInitials,
} from "@/app/testimonials/model/testimonial.model";

const PLACEHOLDERS: Record<string, string> = {
  name: "e.g. Hodan A.",
  initials: "e.g. HA",
  role: "e.g. Data Analyst, Dublin",
  location: "e.g. Dublin, Ireland",
};

type TestimonialFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
};

function TestimonialInput({
  field,
  value,
  error,
  onChange,
  onNameChange,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onNameChange?: (name: string) => void;
}) {
  const inputClass = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
    error ? "border-red-400" : "border-slate-300"
  }`;

  if (field.key === "sortOrder") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</label>
        <input
          type="text"
          inputMode="numeric"
          value={
            value === "" || value === undefined || value === null ? "" : String(value)
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^\d+$/.test(v)) {
              onChange(v === "" ? "" : Number(v));
            }
          }}
          placeholder="e.g. 1"
          className={inputClass}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
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
          rows={4}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What the learner said about Yaclam"
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
        type="text"
        value={String(value ?? "")}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next);
          if (field.key === "name" && onNameChange) {
            onNameChange(next);
          }
        }}
        placeholder={PLACEHOLDERS[field.key]}
        className={inputClass}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function chunkFields<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function TestimonialForm({ fields, form, formErrors, onChange }: TestimonialFormProps) {
  const gridFields = fields.filter((f) => !TESTIMONIAL_FULL_WIDTH_KEYS.has(f.key));
  const quoteField = fields.find((f) => f.key === "description");
  const gridRows = chunkFields(gridFields, 3);

  const handleNameChange = (name: string) => {
    if (!String(form.initials ?? "").trim() && name.trim()) {
      onChange("initials", deriveInitials(name));
    }
  };

  return (
    <div className="space-y-4">
      {formErrors._form && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formErrors._form}</p>
      )}

      {gridRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {row.map((field) => (
            <TestimonialInput
              key={field.key}
              field={field}
              value={form[field.key]}
              error={formErrors[field.key]}
              onChange={(value) => onChange(field.key, value)}
              onNameChange={field.key === "name" ? handleNameChange : undefined}
            />
          ))}
        </div>
      ))}

      {quoteField && (
        <TestimonialInput
          field={quoteField}
          value={form[quoteField.key]}
          error={formErrors[quoteField.key]}
          onChange={(value) => onChange(quoteField.key, value)}
        />
      )}
    </div>
  );
}
