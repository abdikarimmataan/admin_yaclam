"use client";

import { ExternalLink, Plus, Trash2 } from "lucide-react";
import {
  emptyCourseResource,
  RESOURCE_FILE_ACCEPT,
  RESOURCE_MAX_SIZE_MB,
  resolveUploadUrl,
  type CourseResourceFormRow,
} from "@/app/courses/model/course.model";
import { FileUploadDropzone } from "@/shared/components/FileUploadDropzone";

type CourseResourcesPanelProps = {
  resourceIdPrefix: string;
  resources: CourseResourceFormRow[];
  errors?: Record<string, string>;
  onChange: (resources: CourseResourceFormRow[]) => void;
};

export function CourseResourcesPanel({
  resourceIdPrefix,
  resources,
  errors = {},
  onChange,
}: CourseResourcesPanelProps) {
  const updateResource = (index: number, patch: Partial<CourseResourceFormRow>) => {
    onChange(resources.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addResource = () => {
    onChange([...resources, emptyCourseResource(resources.length, resourceIdPrefix)]);
  };

  const removeResource = (index: number) => {
    onChange(resources.filter((_, i) => i !== index));
  };

  const clearFile = (index: number) => {
    updateResource(index, {
      fileUrl: "",
      fileName: "",
      fileSize: 0,
      mimeType: "",
      pendingFile: null,
    });
  };

  return (
    <div className="space-y-4">
      {errors._form && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{errors._form}</p>
      )}

      {resources.length === 0 && (
        <p className="text-sm text-slate-500">
          No resources yet. Add a downloadable document for students.
        </p>
      )}

      {resources.map((resource, index) => {
        const fileUrl = String(resource.fileUrl ?? "").trim();
        const existingFileName = String(resource.fileName ?? "").trim();

        return (
          <div
            key={resource.id ?? `resource-${index}`}
            className="rounded-lg border border-gray-200 bg-gray-50/50 p-3"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <div>
                  <input
                    value={String(resource.title ?? "")}
                    onChange={(e) => updateResource(index, { title: e.target.value })}
                    placeholder="Resource title *"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  {errors[`resource-${index}-title`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`resource-${index}-title`]}
                    </p>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={String(resource.sortOrder ?? index)}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    updateResource(index, {
                      sortOrder: raw === "" ? index : Number(raw),
                    });
                  }}
                  placeholder="e.g. 1"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeResource(index)}
                className="rounded p-1 text-red-500 hover:bg-red-50"
                aria-label="Remove resource"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={String(resource.description ?? "")}
              onChange={(e) => updateResource(index, { description: e.target.value })}
              placeholder="Short description (e.g. Week 1 lecture slides)"
              rows={2}
              className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />

            <label className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={resource.isVisible !== false}
                onChange={(e) => updateResource(index, { isVisible: e.target.checked })}
              />
              Resource visible
            </label>

            {fileUrl && !resource.pendingFile ? (
              <div className="mb-3 rounded-md border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-medium text-slate-700">Current file</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-900">
                    {existingFileName || fileUrl.split("/").pop()}
                  </span>
                  <a
                    href={resolveUploadUrl(fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => clearFile(index)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              </div>
            ) : null}

            <FileUploadDropzone
              accept={RESOURCE_FILE_ACCEPT}
              file={resource.pendingFile ?? null}
              onChange={(file) => updateResource(index, { pendingFile: file })}
              labelSuffix="resource document"
              helperText="PDF, Word, Excel, PowerPoint, ZIP, TXT, CSV (max 100MB)"
              maxSizeMb={RESOURCE_MAX_SIZE_MB}
              error={errors[`resource-${index}-file`]}
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={addResource}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Add resource
      </button>
    </div>
  );
}
