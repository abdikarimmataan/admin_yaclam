"use client";

import type { FormField } from "@/app/frontend/CMS/config/api-modules";
import { FooterColumnsEditor } from "@/app/frontend/CMS/components/FooterColumnsEditor";
import { StatsListEditor } from "@/app/frontend/CMS/components/StatsListEditor";

type CmsFormFieldsProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
};

function textInputValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") return "";
  return String(value);
}

function numberInputValue(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

type FieldSegment =
  | { kind: "grid"; columns: 2; fields: FormField[] }
  | { kind: "row"; columns: 2 | 4; fields: FormField[] };

function segmentFields(fields: FormField[]): FieldSegment[] {
  const segments: FieldSegment[] = [];
  let gridBuffer: FormField[] = [];
  let rowBuffer: FormField[] = [];
  let currentRowGroup: string | undefined;

  const flushGrid = () => {
    if (gridBuffer.length) {
      segments.push({ kind: "grid", columns: 2, fields: gridBuffer });
      gridBuffer = [];
    }
  };

  const flushRow = () => {
    if (rowBuffer.length) {
      const columns = rowBuffer[0]?.rowColumns ?? 4;
      segments.push({ kind: "row", columns, fields: rowBuffer });
      rowBuffer = [];
      currentRowGroup = undefined;
    }
  };

  for (const field of fields) {
    if (field.rowGroup) {
      flushGrid();
      if (currentRowGroup && field.rowGroup !== currentRowGroup) flushRow();
      currentRowGroup = field.rowGroup;
      rowBuffer.push(field);
    } else {
      flushRow();
      gridBuffer.push(field);
    }
  }

  flushRow();
  flushGrid();
  return segments;
}

function FormFieldControl({
  field,
  value,
  err,
  onChange,
  compact,
  halfRow,
}: {
  field: FormField;
  value: unknown;
  err?: string;
  onChange: (key: string, value: unknown) => void;
  compact?: boolean;
  halfRow?: boolean;
}) {
  if (field.type === "boolean") {
    return (
      <label
        className={`flex w-full flex-col gap-1.5 text-sm font-medium text-gray-700 ${
          halfRow ? "" : compact ? "h-full justify-end" : "sm:col-span-2"
        }`}
      >
        <span className="text-sm font-semibold text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </span>
        <span className="flex min-h-[38px] items-center gap-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-xs text-gray-500">{value ? "Visible" : "Hidden"}</span>
        </span>
      </label>
    );
  }

  const common = `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    err ? "border-red-300" : "border-gray-300"
  }`;

  if (field.type === "textarea") {
    return (
      <div className={compact ? undefined : "sm:col-span-2"}>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <textarea
          rows={3}
          value={textInputValue(value)}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={common}
        />
        {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
      </div>
    );
  }

  if (field.type === "statsList") {
    return (
      <StatsListEditor
        label={field.label}
        value={value}
        error={err}
        onChange={(items) => onChange(field.key, items)}
      />
    );
  }

  if (field.type === "footerColumnsList") {
    return (
      <FooterColumnsEditor
        label={field.label}
        value={value}
        error={err}
        onChange={(items) => onChange(field.key, items)}
      />
    );
  }

  if (
    field.type === "linkList" ||
    field.type === "paymentList" ||
    field.type === "stepsList"
  ) {
    const placeholder =
      field.type === "linkList"
        ? "label|url|isVisible  (one per line)"
        : field.type === "paymentList"
          ? "name|icon|isVisible  (one per line)"
          : "title|description|order|isVisible  (one per line)";
    return (
      <div className={compact ? undefined : "sm:col-span-2"}>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <textarea
          rows={4}
          value={textInputValue(value)}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={`${common} font-mono text-xs`}
          placeholder={placeholder}
        />
        <p className="mt-1 text-xs text-gray-500">Use | separator. Boolean: true/false.</p>
        {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
      </div>
    );
  }

  if (field.type === "stringList") {
    return (
      <div className={compact ? undefined : "sm:col-span-2"}>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type="text"
          value={textInputValue(value)}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={common}
          placeholder="item1, item2, item3"
        />
        {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
        value={field.type === "number" ? numberInputValue(value) : textInputValue(value)}
        onChange={(e) =>
          onChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)
        }
        className={common}
      />
      {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
    </div>
  );
}

export function CmsFormFields({ fields, form, errors, onChange }: CmsFormFieldsProps) {
  const segments = segmentFields(fields);

  return (
    <div className="space-y-3.5">
      {segments.map((segment, index) => {
        if (segment.kind === "row") {
          const isHalfRow = segment.columns === 2;
          return (
            <div
              key={`row-${segment.fields[0]?.rowGroup ?? index}`}
              className={
                isHalfRow
                  ? "grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2"
                  : "grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
              }
            >
              {segment.fields.map((field) => (
                <FormFieldControl
                  key={field.key}
                  field={field}
                  value={form[field.key]}
                  err={errors[field.key]}
                  onChange={onChange}
                  compact={!isHalfRow}
                  halfRow={isHalfRow}
                />
              ))}
            </div>
          );
        }

        return (
          <div key={`grid-${index}`} className="grid gap-3.5 sm:grid-cols-2">
            {segment.fields.map((field) => (
              <FormFieldControl
                key={field.key}
                field={field}
                value={form[field.key]}
                err={errors[field.key]}
                onChange={onChange}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
