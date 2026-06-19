"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { FileImage, Film, Loader2 } from "lucide-react";

type FileUploadDropzoneProps = {
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  /** Text after the orange "Upload" label, e.g. "Thumbnail image" */
  labelSuffix: string;
  helperText?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  error?: string;
  previewUrl?: string;
  previewAlt?: string;
  /** When true, image preview renders inside the dropzone instead of below it */
  previewInside?: boolean;
  size?: "default" | "sm";
  icon?: "image" | "video";
  loading?: boolean;
};

function formatMaxSize(mb: number) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(0)}GB`;
  return `${mb}MB`;
}

export function FileUploadDropzone({
  accept,
  file,
  onChange,
  labelSuffix,
  helperText,
  maxSizeMb,
  disabled = false,
  error,
  previewUrl,
  previewAlt = "Upload preview",
  previewInside = false,
  size = "default",
  icon = "image",
  loading = false,
}: FileUploadDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const resolvedHelper =
    helperText ??
    (maxSizeMb
      ? `File size of your documents should not exceed ${formatMaxSize(maxSizeMb)}`
      : undefined);

  const pickFile = (next: File | null) => {
    setLocalError("");
    if (!next) {
      onChange(null);
      return;
    }

    if (maxSizeMb && next.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`File must be ${formatMaxSize(maxSizeMb)} or smaller.`);
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onChange(next);
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    pickFile(event.target.files?.[0] ?? null);
  };

  const displayError = error || localError;
  const isSm = size === "sm";
  const isDisabled = disabled || loading;
  const Icon = icon === "video" ? Film : FileImage;
  const showInlinePreview = previewInside && previewUrl && !loading;

  const openPicker = () => {
    if (isDisabled || !inputRef.current) return;
    inputRef.current.click();
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (isDisabled) return;
    pickFile(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div className={isSm ? "space-y-1" : "space-y-2"}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={isDisabled}
        onChange={onInputChange}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        onFocus={(event) => event.target.blur()}
      />

      <div
        role="button"
        tabIndex={-1}
        aria-disabled={isDisabled}
        aria-labelledby={`${inputId}-label`}
        onClick={openPicker}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isDisabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        className={[
          "relative flex cursor-pointer flex-col items-center justify-center border border-dashed bg-white text-center transition-colors",
          isSm ? "rounded-xl px-3 py-3.5" : "rounded-2xl px-6 py-8",
          showInlinePreview && isSm ? "min-h-[140px] overflow-hidden p-2" : "",
          showInlinePreview && !isSm ? "min-h-[200px] overflow-hidden p-3" : "",
          isDisabled ? "cursor-not-allowed opacity-60" : "hover:bg-orange-50/40",
          dragging ? "border-orange-500 bg-orange-50/60" : "border-orange-400",
          displayError ? "border-red-400" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showInlinePreview ? (
          <>
            <Image
              src={previewUrl}
              alt={previewAlt ?? ""}
              width={320}
              height={144}
              unoptimized
              className="max-h-28 w-full rounded-lg object-contain sm:max-h-36"
            />
            <p className={`mt-2 text-gray-700 ${isSm ? "text-xs" : "text-sm"}`}>
              <span className="font-medium text-orange-500">Change</span>{" "}
              <span className="font-bold">{labelSuffix}</span>
            </p>
          </>
        ) : (
          <>
            <span
              className={[
                "grid place-items-center rounded-full bg-orange-100 text-orange-500",
                isSm ? "mb-2 h-9 w-9" : "mb-4 h-14 w-14",
              ].join(" ")}
            >
              {loading ? (
                <Loader2
                  className={isSm ? "h-4 w-4 animate-spin" : "h-7 w-7 animate-spin"}
                  strokeWidth={1.75}
                />
              ) : (
                <Icon
                  className={isSm ? "h-4 w-4" : "h-7 w-7"}
                  strokeWidth={1.75}
                />
              )}
            </span>

            <p
              id={`${inputId}-label`}
              className={
                isSm ? "text-xs leading-snug text-gray-900" : "text-base leading-snug text-gray-900"
              }
            >
              <span className="font-medium text-orange-500">
                {loading ? "Uploading" : "Upload"}
              </span>{" "}
              <span className="font-bold">{labelSuffix}</span>
            </p>

            {file ? (
              <p className={`mt-1 font-medium text-gray-700 ${isSm ? "text-xs" : "text-sm"}`}>
                {file.name}
              </p>
            ) : null}
          </>
        )}

        {!showInlinePreview && resolvedHelper ? (
          <p
            className={`mt-1 text-gray-500 ${isSm ? "max-w-full text-[11px] leading-tight" : "mt-2 max-w-xs text-sm"}`}
          >
            {resolvedHelper}
          </p>
        ) : null}

        {showInlinePreview && resolvedHelper ? (
          <p className="mt-1 max-w-full text-[11px] leading-tight text-gray-500">{resolvedHelper}</p>
        ) : null}
      </div>

      {displayError ? (
        <p className={isSm ? "text-xs text-red-600" : "text-sm text-red-600"}>{displayError}</p>
      ) : null}

      {previewUrl && !previewInside ? (
        <Image
          src={previewUrl}
          alt={previewAlt ?? ""}
          width={isSm ? 112 : 160}
          height={isSm ? 64 : 96}
          unoptimized
          className={
            isSm
              ? "h-16 w-28 rounded-md border border-gray-200 object-cover"
              : "h-24 w-40 rounded-md border border-gray-200 object-cover"
          }
        />
      ) : null}
    </div>
  );
}
