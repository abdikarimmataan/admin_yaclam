"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { FormField } from "@/app/frontend/CMS/config/api-modules";
import { CmsFormFields } from "@/app/frontend/CMS/components/CmsFormFields";

type CollapsibleFormPanelProps = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  form: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
  defaultOpen?: boolean;
  children?: ReactNode;
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
  children,
}: CollapsibleFormPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  const errorCount = useMemo(
    () => fields.filter((field) => Boolean(errors[field.key])).length,
    [fields, errors]
  );

  useEffect(() => {
    if (errorCount > 0) setOpen(true);
  }, [errorCount, errors]);

  if (!fields.length && !children) return null;

  return (
    <div
      className={`rounded-lg border bg-white ${
        errorCount > 0 ? "border-red-200" : "border-gray-200"
      }`}
    >
      <button
        type="button"
        id={`panel-${id}`}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-gray-50"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
        )}
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {errorCount > 0 && (
          <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            {errorCount} error{errorCount > 1 ? "s" : ""}
          </span>
        )}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {description && <p className="mb-3 text-xs text-gray-500">{description}</p>}
          {children}
          {fields.length > 0 ? (
            <CmsFormFields fields={fields} form={form} errors={errors} onChange={onChange} />
          ) : null}
        </div>
      )}
    </div>
  );
}
