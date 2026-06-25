"use client";

import type { ReactNode } from "react";
import type { FormField } from "@/app/frontend/CMS/config/api-modules";
import { FooterColumnsEditor } from "@/app/frontend/CMS/components/FooterColumnsEditor";
import { FeaturedCoursesGridPreview } from "@/app/frontend/CMS/components/FeaturedCoursesGridPreview";
import { StatsListEditor } from "@/app/frontend/CMS/components/StatsListEditor";
import { IconSelectField } from "@/shared/components/IconSelectField";
import { Select2 } from "@/shared/components/Select2";
import { formFieldDomId } from "@/shared/utils/form-validation";

function roundDecimals(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function parseNumberFieldValue(raw: string, decimals?: number): number | string {
  if (!raw) return "";
  if (!/^-?\d*\.?\d*$/.test(raw)) return raw;
  if (raw.endsWith(".") || raw === "-" || raw === "-.") return raw;
  const num = Number(raw);
  if (!Number.isFinite(num)) return raw;
  if (decimals != null) return roundDecimals(num, decimals);
  return num;
}

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

type FieldSegment =
  | { kind: "grid"; columns: 2; fields: FormField[] }
  | { kind: "row"; columns: 2 | 3 | 4; fields: FormField[] };

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

function FieldAnchor({
  fieldKey,
  error,
  children,
}: {
  fieldKey: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div
      id={formFieldDomId(fieldKey)}
      data-form-field={fieldKey}
      aria-invalid={error ? true : undefined}
      className={error ? "rounded-md ring-1 ring-red-200 ring-offset-1" : undefined}
    >
      {children}
    </div>
  );
}

function FormFieldControl({
  field,
  value,
  form,
  err,
  onChange,
  compact,
  halfRow,
  fullWidth,
}: {
  field: FormField;
  value: unknown;
  form: Record<string, unknown>;
  err?: string;
  onChange: (key: string, value: unknown) => void;
  compact?: boolean;
  halfRow?: boolean;
  fullWidth?: boolean;
}) {
  if (field.type === "icon" || field.key === "icon" || field.key.endsWith(".icon")) {
    return (
      <FieldAnchor fieldKey={field.key} error={err}>
        <IconSelectField
          label={field.label}
          required={field.required}
          value={textInputValue(value)}
          onChange={(v) => onChange(field.key, v)}
          error={err}
          placeholder={field.placeholder}
        />
      </FieldAnchor>
    );
  }

  if (field.type === "select") {
    const selectOptions = (field.options ?? []).map((option) => ({
      id: option.value,
      text: option.label,
    }));

    return (
      <FieldAnchor fieldKey={field.key} error={err}>
        <div className={compact ? undefined : halfRow ? undefined : "sm:col-span-2"}>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          <Select2
            options={selectOptions}
            value={textInputValue(value)}
            onChange={(v) => onChange(field.key, v)}
            placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}…`}
            searchPlaceholder={`Search ${field.label.toLowerCase()}…`}
            error={err}
            allowClear={!field.required}
          />
        </div>
      </FieldAnchor>
    );
  }

  if (field.type === "boolean") {
    return (
      <FieldAnchor fieldKey={field.key} error={err}>
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
      </FieldAnchor>
    );
  }

  const common = `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    err ? "border-red-300" : "border-gray-300"
  }`;

  if (field.type === "number") {
    const displayValue =
      value == null || value === "" ? "" : String(value);

    return (
      <FieldAnchor fieldKey={field.key} error={err}>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (!raw) {
                onChange(field.key, "");
                return;
              }
              onChange(
                field.key,
                parseNumberFieldValue(raw, field.decimals)
              );
            }}
            className={common}
            placeholder={field.placeholder}
          />
          {field.decimals != null && (
            <p className="mt-1 text-xs text-gray-500">Up to {field.decimals} decimal places (e.g. 0.10)</p>
          )}
          {field.hint && (
            <p className="mt-1 text-xs text-gray-500">{field.hint}</p>
          )}
          {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
        </div>
      </FieldAnchor>
    );
  }

  if (field.type === "textarea") {
    return (
      <FieldAnchor fieldKey={field.key} error={err}>
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
            placeholder={field.placeholder}
          />
          {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
        </div>
      </FieldAnchor>
    );
  }

  if (field.type === "statsList") {
    return (
      <FieldAnchor fieldKey={field.key} error={err}>
        <StatsListEditor
          label={field.label}
          value={value}
          error={err}
          onChange={(items) => onChange(field.key, items)}
        />
      </FieldAnchor>
    );
  }

  if (field.type === "featuredGridPreview") {
    return (
      <FieldAnchor fieldKey={field.key} error={err}>
        <div className={fullWidth ? "col-span-full" : "sm:col-span-2"}>
          <FeaturedCoursesGridPreview
            rows={form["featuredCoursesSection.gridRows"]}
            columns={form["featuredCoursesSection.gridColumns"]}
          />
        </div>
      </FieldAnchor>
    );
  }

  if (field.type === "footerColumnsList") {
    return (
      <FieldAnchor fieldKey={field.key} error={err}>
        <FooterColumnsEditor
          label={field.label}
          value={value}
          error={err}
          onChange={(items) => onChange(field.key, items)}
        />
      </FieldAnchor>
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
      <FieldAnchor fieldKey={field.key} error={err}>
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
      </FieldAnchor>
    );
  }

  if (field.type === "stringList") {
    return (
      <FieldAnchor fieldKey={field.key} error={err}>
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
            placeholder={field.placeholder ?? "item1, item2, item3"}
          />
          {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
        </div>
      </FieldAnchor>
    );
  }

  return (
    <FieldAnchor fieldKey={field.key} error={err}>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type={field.type === "email" ? "email" : "text"}
          value={textInputValue(value)}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={common}
          placeholder={field.placeholder}
        />
        {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
      </div>
    </FieldAnchor>
  );
}

export function CmsFormFields({ fields, form, errors, onChange }: CmsFormFieldsProps) {
  const segments = segmentFields(fields);

  return (
    <div className="space-y-3.5">
      {segments.map((segment, index) => {
        if (segment.kind === "row") {
          const isHalfRow = segment.columns === 2;
          const isTripleRow = segment.columns === 3;
          return (
            <div
              key={`row-${segment.fields[0]?.rowGroup ?? index}`}
              className={
                isTripleRow
                  ? "grid w-full grid-cols-1 gap-3.5 sm:grid-cols-3"
                  : isHalfRow
                    ? "grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2"
                    : "grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
              }
            >
              {segment.fields.map((field) => (
                <FormFieldControl
                  key={field.key}
                  field={field}
                  value={form[field.key]}
                  form={form}
                  err={errors[field.key]}
                  onChange={onChange}
                  compact={!isHalfRow && !isTripleRow}
                  halfRow={isHalfRow || isTripleRow}
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
                form={form}
                err={errors[field.key]}
                onChange={onChange}
                fullWidth={field.fullWidth}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
