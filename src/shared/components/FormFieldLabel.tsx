"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { InfoHoverTooltip } from "@/shared/components/InfoHoverTooltip";

type FormFieldLabelProps = {
  field: Pick<FormField, "label" | "required" | "hint">;
};

export function FormFieldLabel({ field }: FormFieldLabelProps) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
      <span>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </span>
      {field.hint ? <InfoHoverTooltip content={field.hint} /> : null}
    </label>
  );
}

export function FormFieldHint({ hint }: { hint?: string }) {
  if (!hint) return null;
  return <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>;
}
