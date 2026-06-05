"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { ScholarshipStringListEditor } from "@/app/scholarship/components/ScholarshipStringListEditor";
import {
  SCHOLARSHIP_FORM_FIELDS,
  SCHOLARSHIP_FULL_WIDTH_KEYS,
  SCHOLARSHIP_FUNDING_TYPES,
} from "@/app/scholarship/model/scholarship.model";

const PLACEHOLDERS: Record<string, string> = {
  name: "e.g. Chevening Scholarship",
  provider: "e.g. UK Government",
  country: "e.g. United Kingdom",
  level: "e.g. Masters",
  flag: "e.g. 🇬🇧",
  amount: "e.g. Full tuition + stipend",
  deadline: "e.g. Dec 31, 2026",
  website: "https://www.example.org/",
  applicationUrl: "https://www.example.org/apply",
};

const LIST_CONFIG: Record<
  string,
  { label: string; addLabel: string; placeholder: string }
> = {
  benefits: {
    label: "Benefits",
    addLabel: "Add benefit",
    placeholder: "e.g. Full tuition fees",
  },
  eligibility: {
    label: "Eligibility",
    addLabel: "Add requirement",
    placeholder: "e.g. Bachelor's degree",
  },
  documents: {
    label: "Documents Required",
    addLabel: "Add document",
    placeholder: "e.g. Transcripts",
  },
};

type ScholarshipFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
};

function ScholarshipInput({
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

  if (field.key === "funding") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</label>
        <select
          value={String(value ?? "Full")}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          {SCHOLARSHIP_FUNDING_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

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
          placeholder="Describe this scholarship for learners"
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
        onChange={(e) => onChange(e.target.value)}
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

export function ScholarshipForm({ fields, form, formErrors, onChange }: ScholarshipFormProps) {
  const gridFields = fields.filter((f) => !SCHOLARSHIP_FULL_WIDTH_KEYS.has(f.key));
  const overviewField = fields.find((f) => f.key === "overview");
  const listFields = SCHOLARSHIP_FORM_FIELDS.filter((f) =>
    ["benefits", "eligibility", "documents"].includes(f.key)
  ).filter((f) => fields.some((ff) => ff.key === f.key));

  const gridRows = chunkFields(gridFields, 3);

  return (
    <div className="space-y-4">
      {formErrors._form && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formErrors._form}</p>
      )}

      {gridRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {row.map((field) => (
            <ScholarshipInput
              key={field.key}
              field={field}
              value={form[field.key]}
              error={formErrors[field.key]}
              onChange={(value) => onChange(field.key, value)}
            />
          ))}
        </div>
      ))}

      {overviewField && (
        <ScholarshipInput
          field={overviewField}
          value={form[overviewField.key]}
          error={formErrors[overviewField.key]}
          onChange={(value) => onChange(overviewField.key, value)}
        />
      )}

      {listFields.map((field) => {
        const config = LIST_CONFIG[field.key];
        if (!config) return null;
        return (
          <ScholarshipStringListEditor
            key={field.key}
            label={config.label}
            addLabel={config.addLabel}
            placeholder={config.placeholder}
            value={form[field.key]}
            error={formErrors[field.key]}
            onChange={(items) => onChange(field.key, items)}
          />
        );
      })}
    </div>
  );
}
