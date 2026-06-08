"use client";

import { useEffect, useMemo } from "react";
import { resolveUploadUrl } from "@/app/courses/model/course.model";
import { FileUploadDropzone } from "@/shared/components/FileUploadDropzone";
import { Select2, type Select2Option } from "@/shared/components/Select2";

export type FieldOption = Select2Option;

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
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            Field <span className="text-red-500">*</span>
          </label>
          <Select2
            options={fieldOptions}
            value={fieldId}
            onChange={onFieldChange}
            placeholder="Select a field…"
            searchPlaceholder="Search fields…"
            error={fieldError}
            showIcons
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FileUploadDropzone
              accept="image/jpeg,image/png,image/webp,image/gif"
              file={thumbnailFile}
              onChange={onThumbnailFileChange}
              labelSuffix="Thumbnail image"
              maxSizeMb={25}
              helperText="File size of your image should not exceed 25MB"
              previewUrl={previewUrl || undefined}
              previewAlt="Thumbnail preview"
            />
          </div>

          <div>
            <FileUploadDropzone
              accept="video/mp4,video/webm,video/quicktime"
              file={videoFile}
              onChange={onVideoFileChange}
              labelSuffix="Course video"
              maxSizeMb={2048}
              helperText="File size of your video should not exceed 2GB"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
