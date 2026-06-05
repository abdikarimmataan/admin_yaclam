"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import type { Select2Option } from "@/shared/components/Select2";
import { Select2 } from "@/shared/components/Select2";
import { BlogTagsEditor } from "@/app/blog/components/BlogTagsEditor";
import { BLOG_FULL_WIDTH_KEYS } from "@/app/blog/model/blog.model";

const PLACEHOLDERS: Record<string, string> = {
  title: "e.g. How to start your data career",
  excerpt: "Short summary shown in listings",
  publishedDate: "e.g. 2026-01-15",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15";

type BlogFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  categoryOptions: Select2Option[];
  onChange: (key: string, value: unknown) => void;
};

function BlogInput({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const fieldClass = `${inputClass} ${error ? "border-red-400" : ""}`;

  if (field.key === "readTime") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</label>
        <input
          type="text"
          inputMode="numeric"
          value={
            value === "" || value === undefined || value === null ? "" : String(value)
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^\d+$/.test(v)) {
              onChange(v === "" ? "" : Number(v));
            }
          }}
          placeholder="e.g. 5"
          className={fieldClass}
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
          rows={field.key === "content" ? 8 : 3}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            field.key === "content"
              ? "Write the article. Use blank lines between paragraphs."
              : PLACEHOLDERS[field.key]
          }
          className={fieldClass}
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
        className={fieldClass}
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

export function BlogForm({ fields, form, formErrors, categoryOptions, onChange }: BlogFormProps) {
  const gridFields = fields.filter(
    (f) => !BLOG_FULL_WIDTH_KEYS.has(f.key) && f.key !== "tags"
  );
  const fullWidthFields = fields.filter(
    (f) => BLOG_FULL_WIDTH_KEYS.has(f.key) && f.key !== "categoryId"
  );
  const gridRows = chunkFields(gridFields, 3);
  const categoryField = fields.find((f) => f.key === "categoryId");

  return (
    <div className="space-y-4">
      {formErrors._form && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formErrors._form}</p>
      )}

      {categoryField && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {categoryField.label}
            {categoryField.required && <span className="text-red-500"> *</span>}
          </label>
          <Select2
            options={categoryOptions}
            value={String(form.categoryId ?? "")}
            onChange={(v) => onChange("categoryId", v)}
            placeholder="Select a category…"
            error={formErrors.categoryId}
          />
        </div>
      )}

      {gridRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {row.map((field) => (
            <BlogInput
              key={field.key}
              field={field}
              value={form[field.key]}
              error={formErrors[field.key]}
              onChange={(value) => onChange(field.key, value)}
            />
          ))}
        </div>
      ))}

      {fullWidthFields.map((field) => (
        <BlogInput
          key={field.key}
          field={field}
          value={form[field.key]}
          error={formErrors[field.key]}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}

      <BlogTagsEditor
        value={form.tags}
        error={formErrors.tags}
        onChange={(items) => onChange("tags", items)}
      />
    </div>
  );
}
