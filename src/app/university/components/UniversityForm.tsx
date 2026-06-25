"use client";

import { useMemo } from "react";
import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { FormFieldHint, FormFieldLabel } from "@/shared/components/FormFieldLabel";
import { CountryIdSelectField } from "@/shared/components/CountryIdSelectField";
import { MultiSelect2 } from "@/shared/components/MultiSelect2";
import { Select2, type Select2Option } from "@/shared/components/Select2";

type UniversityFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  locationOptions: Select2Option[];
  categoryOptions: Select2Option[];
  languageOptions: Select2Option[];
  optionsLoading?: boolean;
  onChange: (key: string, value: unknown) => void;
};

export function UniversityForm({
  fields,
  form,
  formErrors,
  locationOptions,
  categoryOptions,
  languageOptions,
  optionsLoading = false,
  onChange,
}: UniversityFormProps) {
  const languageValues = useMemo(
    () => (Array.isArray(form.languageIds) ? (form.languageIds as string[]) : []),
    [form.languageIds]
  );

  const selectedCountryId = String(form.countryId ?? "").trim();
  const showLocationField = Boolean(selectedCountryId);

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
              value={selectedCountryId}
              onChange={(value) => onChange("countryId", value)}
              error={formErrors.countryId}
            />
          );
        }

        if (field.key === "locationId") {
          if (!showLocationField) return null;
          return (
            <div key={field.key}>
              <FormFieldLabel field={field} />
              <Select2
                options={locationOptions}
                value={String(form.locationId ?? "")}
                onChange={(value) => onChange("locationId", value)}
                placeholder="Select location…"
                searchPlaceholder="Search locations…"
                error={formErrors.locationId}
                loading={optionsLoading}
                disabled={!selectedCountryId}
              />
              <FormFieldHint hint={field.hint} />
            </div>
          );
        }

        if (field.key === "categoryId") {
          return (
            <div key={field.key}>
              <FormFieldLabel field={field} />
              <Select2
                options={categoryOptions}
                value={String(form.categoryId ?? "")}
                onChange={(value) => onChange("categoryId", value)}
                placeholder="Select category…"
                searchPlaceholder="Search categories…"
                error={formErrors.categoryId}
                loading={optionsLoading}
              />
              <FormFieldHint hint={field.hint} />
            </div>
          );
        }

        if (field.key === "languageIds") {
          return (
            <div key={field.key}>
              <FormFieldLabel field={field} />
              <MultiSelect2
                options={languageOptions}
                values={languageValues}
                onChange={(values) => onChange("languageIds", values)}
                placeholder="Select languages…"
                searchPlaceholder="Search languages…"
                error={formErrors.languageIds}
                loading={optionsLoading}
              />
              <FormFieldHint hint={field.hint} />
            </div>
          );
        }

        const error = formErrors[field.key];
        const inputClass = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
          error ? "border-red-400" : "border-slate-300"
        }`;

        if (field.key === "sortOrder") {
          return (
            <div key={field.key}>
              <FormFieldLabel field={field} />
              <input
                type="text"
                inputMode="numeric"
                value={
                  form[field.key] === "" || form[field.key] == null
                    ? ""
                    : String(form[field.key])
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) onChange(field.key, v === "" ? "" : Number(v));
                }}
                placeholder={field.placeholder}
                className={inputClass}
              />
              <FormFieldHint hint={field.hint} />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          );
        }

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
