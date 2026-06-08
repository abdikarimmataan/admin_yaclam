"use client";

import { useEffect, useMemo } from "react";
import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { FileUploadDropzone } from "@/shared/components/FileUploadDropzone";
import type { Select2Option } from "@/shared/components/Select2";
import { Select2 } from "@/shared/components/Select2";
import { resolveAssetUrl } from "@/shared/utils/asset-url";

type InstructorFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  roleOptions: Select2Option[];
  pendingPhotoFile: File | null;
  photoCleared: boolean;
  onPendingPhotoChange: (file: File | null) => void;
  onChange: (key: string, value: unknown) => void;
};

function inputClass(error?: string) {
  return `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
    error ? "border-red-400" : "border-slate-300"
  }`;
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export function InstructorForm({
  fields,
  form,
  formErrors,
  roleOptions,
  pendingPhotoFile,
  photoCleared,
  onPendingPhotoChange,
  onChange,
}: InstructorFormProps) {
  const showPassword = fields.some((field) => field.key === "password");
  const showStatus = fields.some((field) => field.key === "status");
  const statusField = fields.find((field) => field.key === "status");

  const localPreviewUrl = useMemo(
    () => (pendingPhotoFile ? URL.createObjectURL(pendingPhotoFile) : ""),
    [pendingPhotoFile]
  );

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const dropzonePreviewUrl =
    localPreviewUrl ||
    (!photoCleared && !pendingPhotoFile
      ? resolveAssetUrl(String(form.photo ?? ""))
      : "");

  const handlePhotoChange = (file: File | null) => {
    onPendingPhotoChange(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Photo" />
        <FileUploadDropzone
          size="sm"
          accept="image/jpeg,image/png,image/webp,image/gif"
          file={pendingPhotoFile}
          onChange={handlePhotoChange}
          labelSuffix="instructor photo"
          helperText="JPEG, PNG, WebP, GIF · max 25MB"
          maxSizeMb={25}
          previewUrl={dropzonePreviewUrl || undefined}
          previewInside
          previewAlt="Instructor photo"
          error={formErrors.photo}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel label="Name" required />
          <input
            type="text"
            value={String(form.name ?? "")}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g. Ahmed Hassan"
            className={inputClass(formErrors.name)}
          />
          <FieldError message={formErrors.name} />
        </div>

        <div>
          <FieldLabel label="Role" />
          <Select2
            options={roleOptions}
            value={String(form.instructorRoleId ?? "")}
            onChange={(value) => onChange("instructorRoleId", value)}
            placeholder="Select a role…"
            searchPlaceholder="Search roles…"
            allowClear
            error={formErrors.instructorRoleId}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel label="Email" required />
          <input
            type="text"
            value={String(form.email ?? "")}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="e.g. instructor@yaclam.com"
            className={inputClass(formErrors.email)}
          />
          <FieldError message={formErrors.email} />
        </div>

        {showPassword ? (
          <div>
            <FieldLabel label="Password" required />
            <input
              type="password"
              value={String(form.password ?? "")}
              onChange={(e) => onChange("password", e.target.value)}
              className={inputClass(formErrors.password)}
            />
            <FieldError message={formErrors.password} />
          </div>
        ) : (
          <div>
            <FieldLabel label="Phone" />
            <input
              type="text"
              value={String(form.phone ?? "")}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="e.g. +252 61 234 5678"
              className={inputClass(formErrors.phone)}
            />
            <FieldError message={formErrors.phone} />
          </div>
        )}
      </div>

      {showPassword ? (
        <div>
          <FieldLabel label="Phone" />
          <input
            type="text"
            value={String(form.phone ?? "")}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="e.g. +252 61 234 5678"
            className={inputClass(formErrors.phone)}
          />
          <FieldError message={formErrors.phone} />
        </div>
      ) : null}

      <div>
        <FieldLabel label="Description" />
        <textarea
          rows={4}
          value={String(form.bio ?? "")}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="Short instructor bio"
          className={inputClass(formErrors.bio)}
        />
        <FieldError message={formErrors.bio} />
      </div>

      {showStatus && statusField ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel label={statusField.label} />
            <select
              value={String(form.status ?? "active")}
              onChange={(e) => onChange("status", e.target.value)}
              className={inputClass(formErrors.status)}
            >
              {(statusField.options ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError message={formErrors.status} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
