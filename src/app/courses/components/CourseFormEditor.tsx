"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import type { ApiError } from "@/config/api";
import { CollapsibleFormPanel } from "@/app/frontend/CMS/components/CollapsibleFormPanel";
import { CourseMediaPanel } from "@/app/courses/components/CourseMediaPanel";
import {
  COURSE_FORM_PANELS,
  getCoursePanelFields,
} from "@/app/courses/config/course-form-sections";
import {
  courseApi,
  type CourseUploadFiles,
} from "@/app/courses/service/course.service";
import {
  buildCoursePayload,
  courseRecordToForm,
} from "@/app/courses/validation/course.validation";
import type { FieldOption } from "@/app/courses/components/CourseMediaPanel";
import { confirmDelete, showError } from "@/shared/utils/sweetalert";

type CourseFormEditorProps = {
  recordId: string | null;
  fieldOptions: FieldOption[];
  onBack: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
};

export function CourseFormEditor({
  recordId,
  fieldOptions,
  onBack,
  onSaved,
  onDeleted,
}: CourseFormEditorProps) {
  const [activeRecordId, setActiveRecordId] = useState<string | null>(recordId);
  const editing = Boolean(activeRecordId);
  const [form, setForm] = useState<Record<string, unknown>>(courseRecordToForm(null));
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [uploadFiles, setUploadFiles] = useState<CourseUploadFiles>({});
  const [loading, setLoading] = useState(Boolean(recordId));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const load = useCallback(async () => {
    if (!recordId) {
      setActiveRecordId(null);
      setForm(courseRecordToForm(null));
      setSelectedFieldId("");
      setUploadFiles({});
      setLoading(false);
      return;
    }

    setActiveRecordId(recordId);
    setLoading(true);
    setMessage("");
    setMessageType("");
    try {
      const record = await courseApi.getById(recordId);
      const nextForm = courseRecordToForm(record);
      setForm(nextForm);
      setSelectedFieldId(String(nextForm.fieldId ?? ""));
    } catch (err) {
      setMessage((err as ApiError).message || "Failed to load course");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    load();
  }, [load]);

  const patchForm = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
    setMessageType("");
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next._form;
      return next;
    });
  };

  const handleFieldChange = (value: string) => {
    setSelectedFieldId(value);
    patchForm("fieldId", value);
  };

  const save = async () => {
    const fieldId = selectedFieldId.trim() || String(form.fieldId ?? "").trim();
    if (!fieldId) {
      setErrors({ fieldId: "Field is required" });
      return;
    }

    const formWithField = { ...form, fieldId };
    const { payload, errors: formErrors } = buildCoursePayload(formWithField, editing);
    if (!payload) {
      setErrors(formErrors);
      return;
    }

    const hadRecord = Boolean(activeRecordId);
    setSaving(true);
    setErrors({});
    setMessage("");
    setMessageType("");

    try {
      const saved = await courseApi.save(activeRecordId, payload, uploadFiles);
      const savedId = saved.id ? String(saved.id) : activeRecordId;
      setActiveRecordId(savedId);
      setForm(courseRecordToForm(saved));
      setSelectedFieldId(String(courseRecordToForm(saved).fieldId ?? ""));
      setUploadFiles({});

      if (savedId) {
        await courseApi.updateStatus(savedId, form.status !== false);
      }

      setMessage(hadRecord ? "Course updated." : "Course created.");
      setMessageType("success");
      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage(apiErr.message || "Save failed");
      setMessageType("error");
      if (apiErr.errors?.length) {
        const fieldErrors: Record<string, string> = {};
        apiErr.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeRecordId) return;
    const title = String(form.title ?? "this course");
    const confirmed = await confirmDelete(title);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await courseApi.remove(activeRecordId);
      onDeleted?.();
      onBack();
    } catch (err) {
      await showError((err as ApiError).message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {editing ? "Edit Course" : "Create Course"}
        </h1>
        {activeRecordId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>

      <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-gray-900">Course form</h2>
          {activeRecordId ? (
            <span className="text-xs font-medium text-green-700">
              Record exists — PATCH /course/update/:id on save
            </span>
          ) : (
            <span className="text-xs font-medium text-amber-700">
              New course — POST /course/create on save
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading course…
          </div>
        ) : (
          <>
            <div className="mb-4">
              <CourseMediaPanel
                fieldId={selectedFieldId}
                fieldOptions={fieldOptions}
                onFieldChange={handleFieldChange}
                fieldError={errors.fieldId}
                savedThumbnailUrl={String(form.thumbnail ?? "")}
                thumbnailFile={uploadFiles.thumbnail ?? null}
                videoFile={uploadFiles.video ?? null}
                onThumbnailFileChange={(file) =>
                  setUploadFiles((prev) => ({ ...prev, thumbnail: file }))
                }
                onVideoFileChange={(file) =>
                  setUploadFiles((prev) => ({ ...prev, video: file }))
                }
              />
            </div>

            <div className="space-y-2">
              {COURSE_FORM_PANELS.map((panel, i) => (
                <CollapsibleFormPanel
                  key={panel.id}
                  id={panel.id}
                  title={panel.title}
                  description={panel.description}
                  fields={getCoursePanelFields(panel)}
                  form={form}
                  errors={errors}
                  onChange={patchForm}
                  defaultOpen={i === 0}
                />
              ))}
            </div>

            {message && (
              <p
                className={`mt-3 flex items-center gap-1.5 text-sm ${
                  messageType === "success" ? "text-green-700" : "text-red-600"
                }`}
              >
                {messageType === "success" && (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                {message}
              </p>
            )}

            <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save course"
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
