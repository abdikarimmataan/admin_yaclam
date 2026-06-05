"use client";

import { useEffect, useMemo } from "react";
import { resolveUploadUrl } from "@/app/courses/model/course.model";

export type FieldOption = { id: string; text: string };

type CourseMediaPanelProps = {
  fieldId: string;
  fieldOptions: FieldOption[];
  onFieldChange: (value: string) => void;
  fieldError?: string;
  savedThumbnailUrl?: string;
  thumbnailFile: File | null;
  videoFile: File | null;
  onThumbnailFileChange: (file: File | null) => void;
  onVideoFileChange: (file: File | null) => void;
  error?: string;
};

const selectClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function CourseMediaPanel({
  fieldId,
  fieldOptions,
  onFieldChange,
  fieldError,
  savedThumbnailUrl = "",
  thumbnailFile,
  videoFile,
  onThumbnailFileChange,
  onVideoFileChange,
  error,
}: CourseMediaPanelProps) {
  const filePreviewUrl = useMemo(
    () => (thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""),
    [thumbnailFile]
  );

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const previewUrl =
    filePreviewUrl || (savedThumbnailUrl ? resolveUploadUrl(savedThumbnailUrl) : "");

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Media uploads</h3>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div>
          <label
            htmlFor="course-field-id"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            Field <span className="text-red-500">*</span>
          </label>
          <select
            id="course-field-id"
            value={fieldId}
            onChange={(e) => onFieldChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Select a field…</option>
            {fieldOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.text}
              </option>
            ))}
          </select>
          {fieldError && <p className="mt-1 text-sm text-red-600">{fieldError}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Thumbnail
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => onThumbnailFileChange(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-gray-600"
            />
            {thumbnailFile && (
              <p className="mt-1 text-xs text-gray-500">{thumbnailFile.name}</p>
            )}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Thumbnail preview"
                className="mt-2 h-24 w-40 rounded-md border border-gray-200 object-cover"
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Course video
            </label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => onVideoFileChange(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-gray-600"
            />
            {videoFile && <p className="mt-1 text-xs text-gray-500">{videoFile.name}</p>}
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
