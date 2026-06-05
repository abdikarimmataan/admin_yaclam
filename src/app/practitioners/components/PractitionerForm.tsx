"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import {
  PRACTITIONER_FULL_WIDTH_KEYS,
  deriveInitials,
} from "@/app/practitioners/model/practitioner.model";

const PLACEHOLDERS: Record<string, string> = {
  name: "e.g. Abdikarim Mataan",
  initials: "e.g. AM",
  role: "e.g. Data Analytics & Trading",
  studentsCount: "e.g. 12.4k",
  color: "e.g. #1F3A93",
};

type PractitionerFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
};

function PractitionerInput({
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
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 1"
          className={inputClass}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.key === "coursesCount") {
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
          placeholder="e.g. 5"
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
          placeholder="Short bio shown on the home page"
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

export function PractitionerForm({ fields, form, formErrors, onChange }: PractitionerFormProps) {
  const gridFields = fields.filter((f) => !PRACTITIONER_FULL_WIDTH_KEYS.has(f.key));
  const bioField = fields.find((f) => f.key === "bio");
  const gridRows = chunkFields(gridFields, 3);

  const handleNameChange = (name: string) => {
    if (!String(form.initials ?? "").trim() && name.trim()) {
      onChange("initials", deriveInitials(name));
    }
  };

  return (
    <div className="space-y-4">
      {gridRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {row.map((field) => (
            <PractitionerInput
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

      {bioField && (
        <PractitionerInput
          field={bioField}
          value={form[bioField.key]}
          error={formErrors[bioField.key]}
          onChange={(value) => onChange(bioField.key, value)}
        />
      )}
    </div>
  );
}
