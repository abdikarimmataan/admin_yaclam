"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

type InstructorRoleFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
};

export function InstructorRoleForm({ fields, form, formErrors, onChange }: InstructorRoleFormProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const error = formErrors[field.key];
        const inputClass = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
          error ? "border-red-400" : "border-slate-300"
        }`;

        if (field.type === "textarea") {
          return (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              <textarea
                rows={3}
                value={String(form[field.key] ?? "")}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder="Short role description"
                className={inputClass}
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          );
        }

        return (
          <div key={field.key}>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="text"
              value={String(form[field.key] ?? "")}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.key === "name" ? "e.g. Lead Instructor" : undefined}
              className={inputClass}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}
