"use client";

import { useEffect, useMemo } from "react";
import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import type { Select2Option } from "@/shared/components/Select2";
import { Select2 } from "@/shared/components/Select2";
import { FileUploadDropzone } from "@/shared/components/FileUploadDropzone";
import { resolveAssetUrl } from "@/shared/utils/asset-url";
import { publishedDateToDateInputValue } from "@/app/blog/validation/blog.validation";
import { blogPostApi } from "@/app/blog/service/blog.service";
import { BlogTagsEditor } from "@/app/blog/components/BlogTagsEditor";
import { BLOG_FULL_WIDTH_KEYS } from "@/app/blog/model/blog.model";
import { BlogContentEditor } from "@/shared/components/BlogContentEditor";

const PLACEHOLDERS: Record<string, string> = {
  title: "e.g. How to start your data career",
  excerpt: "Short summary shown in listings",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15";

type BlogFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  categoryOptions: Select2Option[];
  pendingCoverFile: File | null;
  coverCleared: boolean;
  onPendingCoverChange: (file: File | null) => void;
  onChange: (key: string, value: unknown) => void;
};

function BlogInput({
  field,
  value,
  error,
  editorKey,
  onChange,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  editorKey?: string;
  onChange: (value: unknown) => void;
}) {
  const fieldClass = `${inputClass} ${error ? "border-red-400" : ""}`;

  if (field.key === "publishedDate") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type="date"
          value={publishedDateToDateInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

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

  if (field.key === "content") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <BlogContentEditor
          editorKey={editorKey ?? "create-blog"}
          value={String(value ?? "")}
          onChange={(html) => onChange(html)}
          placeholder="Write your article. Use headings, lists, tables, images, links, and embeds."
          error={error}
          onUploadImage={(file) => blogPostApi.uploadCoverImage(file)}
        />
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
          rows={3}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDERS[field.key]}
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

export function BlogForm({
  fields,
  form,
  formErrors,
  categoryOptions,
  pendingCoverFile,
  coverCleared,
  onPendingCoverChange,
  onChange,
}: BlogFormProps) {
  const localPreviewUrl = useMemo(
    () => (pendingCoverFile ? URL.createObjectURL(pendingCoverFile) : ""),
    [pendingCoverFile]
  );

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const coverPreviewUrl =
    localPreviewUrl ||
    (!coverCleared && !pendingCoverFile
      ? resolveAssetUrl(String(form.coverImage ?? ""))
      : "");

  const gridFields = fields.filter(
    (f) => !BLOG_FULL_WIDTH_KEYS.has(f.key) && f.key !== "tags"
  );
  const fullWidthFields = fields.filter(
    (f) => BLOG_FULL_WIDTH_KEYS.has(f.key) && f.key !== "categoryId"
  );
  const gridRows = chunkFields(gridFields, 3);
  const categoryField = fields.find((f) => f.key === "categoryId");
  const contentEditorKey = String(form.id ?? "create-blog");

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Cover image</label>
        <FileUploadDropzone
          size="sm"
          accept="image/jpeg,image/png,image/webp,image/gif"
          file={pendingCoverFile}
          onChange={onPendingCoverChange}
          labelSuffix="blog cover"
          helperText="JPEG, PNG, WebP, GIF · max 25MB"
          maxSizeMb={25}
          previewUrl={coverPreviewUrl || undefined}
          previewInside
          previewAlt="Blog cover"
          error={formErrors.coverImage}
        />
        {coverPreviewUrl ? (
          <button
            type="button"
            onClick={() => onPendingCoverChange(null)}
            className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
          >
            Remove image
          </button>
        ) : null}
      </div>

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
          editorKey={field.key === "content" ? contentEditorKey : undefined}
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
