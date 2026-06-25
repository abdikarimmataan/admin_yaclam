"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { CountryIdSelectField } from "@/shared/components/CountryIdSelectField";
import { FormFieldHint, FormFieldLabel } from "@/shared/components/FormFieldLabel";

type Props = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
};

export function UniversityLocationForm({ fields, form, formErrors, onChange }: Props) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        if (field.key === "countryId") {
          return (
            <CountryIdSelectField
              key={field.key}
              label={field.label}
              required={field.required}
              hint={field.hint}
              value={String(form.countryId ?? "")}
              onChange={(value) => onChange("countryId", value)}
              error={formErrors.countryId}
            />
          );
        }
        const error = formErrors[field.key];
        const inputClass = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
          error ? "border-red-400" : "border-slate-300"
        }`;
        return (
          <div key={field.key}>
            <FormFieldLabel field={field} />
            <input
              type="text"
              value={String(form[field.key] ?? "")}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={inputClass}
            />
            <FormFieldHint hint={field.hint} />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}
