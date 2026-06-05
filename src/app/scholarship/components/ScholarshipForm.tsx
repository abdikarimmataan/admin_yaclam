"use client";

import { useEffect } from "react";
import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { ScholarshipStringListEditor } from "@/app/scholarship/components/ScholarshipStringListEditor";
import {
  SCHOLARSHIP_FORM_FIELDS,
  SCHOLARSHIP_FULL_WIDTH_KEYS,
  SCHOLARSHIP_FUNDING_TYPES,
} from "@/app/scholarship/model/scholarship.model";
import { deadlineToDateInputValue } from "@/app/scholarship/validation/scholarship.validation";
import { getValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import { CountrySelectField } from "@/shared/components/CountrySelectField";
import { useCountrySelectOptions } from "@/shared/hooks/useCountrySelectOptions";

function formFieldValue(form: Record<string, unknown>, key: string): unknown {
  if (key in form) return form[key];
  return getValueByPath(form, key);
}

const PLACEHOLDERS: Record<string, string> = {
  name: "e.g. Chevening Scholarship",
  provider: "e.g. UK Government",
  country: "e.g. United Kingdom",
  level: "e.g. Masters",
  amount: "e.g. Full tuition + stipend",
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
  onCountryChange,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onCountryChange?: (countryName: string) => void;
}) {
  const inputClass = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
    error ? "border-red-400" : "border-slate-300"
  }`;

  if (field.key === "country") {
    return (
      <CountrySelectField
        label={field.label}
        required={field.required}
        value={String(value ?? "")}
        onChange={(countryName) => onCountryChange?.(countryName)}
        error={error}
      />
    );
  }

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

  if (field.key === "deadline") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type="date"
          value={deadlineToDateInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

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
  const { flagByName, loading: countriesLoading } = useCountrySelectOptions();
  const gridFields = fields.filter((f) => !SCHOLARSHIP_FULL_WIDTH_KEYS.has(f.key));
  const overviewField = fields.find((f) => f.key === "overview");
  const listFields = SCHOLARSHIP_FORM_FIELDS.filter((f) =>
    ["benefits", "eligibility", "documents"].includes(f.key)
  ).filter((f) => fields.some((ff) => ff.key === f.key));

  const gridRows = chunkFields(gridFields, 3);

  const handleCountryChange = (countryName: string) => {
    onChange("country", countryName);
    onChange("flag", countryName ? (flagByName.get(countryName) ?? "") : "");
  };

  useEffect(() => {
    const country = String(formFieldValue(form, "country") ?? "").trim();
    if (!country || countriesLoading) return;
    const expectedFlag = flagByName.get(country);
    if (expectedFlag && formFieldValue(form, "flag") !== expectedFlag) {
      onChange("flag", expectedFlag);
    }
  }, [form, countriesLoading, flagByName, onChange]);

  return (
    <div className="space-y-4">
      {gridRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {row.map((field) => (
            <ScholarshipInput
              key={field.key}
              field={field}
              value={formFieldValue(form, field.key)}
              error={formErrors[field.key]}
              onChange={(value) => onChange(field.key, value)}
              onCountryChange={handleCountryChange}
            />
          ))}
        </div>
      ))}

      {overviewField && (
        <ScholarshipInput
          field={overviewField}
          value={formFieldValue(form, overviewField.key)}
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
