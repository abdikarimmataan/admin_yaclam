"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { FormFieldHint, FormFieldLabel } from "@/shared/components/FormFieldLabel";
import { Select2, type Select2Option } from "@/shared/components/Select2";

type ProgramFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  disciplineOptions?: Select2Option[];
  optionsLoading?: boolean;
  onChange: (key: string, value: unknown) => void;
};

export function ProgramForm({
  fields,
  form,
  formErrors,
  disciplineOptions = [],
  optionsLoading = false,
  onChange,
}: ProgramFormProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const error = formErrors[field.key];
        const inputClass = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
          error ? "border-red-400" : "border-slate-300"
        }`;

        if (field.key === "disciplineId") {
          return (
            <div key={field.key}>
              <FormFieldLabel field={field} />
              <Select2
                options={disciplineOptions}
                value={String(form.disciplineId ?? "")}
                onChange={(value) => onChange("disciplineId", value)}
                placeholder="Select discipline (optional)…"
                searchPlaceholder="Search disciplines…"
                error={error}
                loading={optionsLoading}
              />
              <FormFieldHint hint={field.hint} />
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
