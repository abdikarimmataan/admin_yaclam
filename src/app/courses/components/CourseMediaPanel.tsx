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
  savedVideoUrl?: string;
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
  savedVideoUrl = "",
  thumbnailFile,
  videoFile,
  onThumbnailFileChange,
  onVideoFileChange,
  error,
}: CourseMediaPanelProps) {
  const thumbnailPreviewUrl = useMemo(
    () => (thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""),
    [thumbnailFile]
  );

  const videoPreviewUrl = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : ""),
    [videoFile]
  );

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [thumbnailPreviewUrl, videoPreviewUrl]);

  const thumbnailSrc =
    thumbnailPreviewUrl || (savedThumbnailUrl ? resolveUploadUrl(savedThumbnailUrl) : "");

  const videoSrc =
    videoPreviewUrl || (savedVideoUrl ? resolveUploadUrl(savedVideoUrl) : "");

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Media uploads</h3>
        <p className="mt-0.5 text-xs text-gray-500">
          Thumbnail and promo video are saved for this course only.
        </p>
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
              previewUrl={thumbnailSrc || undefined}
              previewAlt="Thumbnail preview"
              previewInside={Boolean(thumbnailSrc)}
            />
          </div>

          <div className="space-y-2">
            <FileUploadDropzone
              accept="video/mp4,video/webm,video/quicktime"
              file={videoFile}
              onChange={onVideoFileChange}
              labelSuffix="Course video"
              maxSizeMb={2048}
              helperText="File size of your video should not exceed 2GB"
              icon="video"
            />
            {videoSrc ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2">
                <video
                  src={videoSrc}
                  controls
                  className="max-h-40 w-full rounded-md bg-black object-contain"
                  preload="metadata"
                />
                <p className="mt-1.5 truncate text-[11px] text-gray-500">
                  {videoFile ? videoFile.name : "Saved course video"}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
