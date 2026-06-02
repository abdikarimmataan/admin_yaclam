"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { FormField } from "@/config/api-modules";
import { CmsFormFields } from "@/components/cms/CmsFormFields";

type CollapsibleFormPanelProps = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  form: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
  defaultOpen?: boolean;
};

export function CollapsibleFormPanel({
  id,
  title,
  description,
  fields,
  form,
  errors,
  onChange,
  defaultOpen = false,
}: CollapsibleFormPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (!fields.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        id={`panel-${id}`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-gray-50"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
        )}
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {description && <p className="mb-3 text-xs text-gray-500">{description}</p>}
          <CmsFormFields fields={fields} form={form} errors={errors} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
