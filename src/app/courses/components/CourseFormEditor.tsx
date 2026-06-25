"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import type { ApiError } from "@/config/api";
import { CollapsibleFormPanel } from "@/app/frontend/CMS/components/CollapsibleFormPanel";
import { CourseInstructorPanel } from "@/app/courses/components/CourseInstructorPanel";
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
import type { InstructorRecord } from "@/app/instructors/model/instructor.model";
import {
  getInstructorLabel,
  getInstructorRecordId,
  getInstructorRoleName,
} from "@/app/instructors/model/instructor.model";
import { instructorApi } from "@/app/instructors/service/instructor.service";
import { resolveAssetUrl } from "@/shared/utils/asset-url";
import type { Select2Option } from "@/shared/components/Select2";
import { confirmDelete, showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

type CourseFormEditorProps = {
  recordId: string | null;
  fieldOptions: FieldOption[];
  courseCategoryOptions: FieldOption[];
  onBack: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
};

export function CourseFormEditor({
  recordId,
  fieldOptions,
  courseCategoryOptions,
  onBack,
  onSaved,
  onDeleted,
}: CourseFormEditorProps) {
  const [activeRecordId, setActiveRecordId] = useState<string | null>(recordId);
  const editing = Boolean(activeRecordId);
  const [form, setForm] = useState<Record<string, unknown>>(courseRecordToForm(null));
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [selectedCourseCategoryId, setSelectedCourseCategoryId] = useState("");
  const [uploadFiles, setUploadFiles] = useState<CourseUploadFiles>({});
  const [loading, setLoading] = useState(Boolean(recordId));
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [instructors, setInstructors] = useState<InstructorRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!recordId) {
      setActiveRecordId(null);
      setForm(courseRecordToForm(null));
      setSelectedFieldId("");
      setSelectedCourseCategoryId("");
      setUploadFiles({});
      setLoading(false);
      return;
    }

    setActiveRecordId(recordId);
    setLoading(true);
    try {
      const record = await courseApi.getById(recordId);
      const nextForm = courseRecordToForm(record);
      setForm(nextForm);
      setSelectedFieldId(String(nextForm.fieldId ?? ""));
      setSelectedCourseCategoryId(String(nextForm.courseCategoryId ?? ""));
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    load();
  }, [load]);

  const fetchInstructors = useCallback(async () => {
    setLoadingInstructors(true);
    try {
      const res = await instructorApi.getAll({ page: 1, pageSize: 500 });
      setInstructors((res.data ?? []) as InstructorRecord[]);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load instructors");
      setInstructors([]);
    } finally {
      setLoadingInstructors(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const instructorOptions: Select2Option[] = useMemo(
    () =>
      instructors
        .map((item) => ({
          id: getInstructorRecordId(item),
          text: getInstructorLabel(item),
          imageUrl: resolveAssetUrl(String(item.photo ?? "")) || undefined,
        }))
        .filter((item) => item.id),
    [instructors]
  );

  const selectedInstructorId = String(form["instructor.instructorId"] ?? "").trim();

  const applyInstructorSelection = (instructorId: string) => {
    const selected =
      instructors.find((item) => getInstructorRecordId(item) === instructorId) ?? null;

    patchForm("instructor.instructorId", instructorId);
    patchForm("instructor.name", selected?.name ?? "");
    patchForm("instructor.role", selected ? getInstructorRoleName(selected) : "");
    patchForm("instructor.bio", selected?.bio ?? "");
    patchForm("instructor.avatar", selected?.photo ?? "");
  };

  const patchForm = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  const handleCourseCategoryChange = (value: string) => {
    setSelectedCourseCategoryId(value);
    patchForm("courseCategoryId", value);
  };

  const save = async () => {
    const fieldId = selectedFieldId.trim() || String(form.fieldId ?? "").trim();
    if (!fieldId) {
      setErrors({ fieldId: "Field is required" });
      return;
    }

    const courseCategoryId =
      selectedCourseCategoryId.trim() || String(form.courseCategoryId ?? "").trim();
    if (!courseCategoryId) {
      setErrors({ courseCategoryId: "Category is required" });
      return;
    }

    const formWithField = { ...form, fieldId, courseCategoryId };
    const { payload, errors: formErrors } = buildCoursePayload(formWithField, editing);
    if (!payload) {
      setErrors(formErrors);
      return;
    }

    const hadRecord = Boolean(activeRecordId);
    setSaving(true);
    setErrors({});

    try {
      const saved = await courseApi.save(activeRecordId, payload, uploadFiles);
      const savedId = saved.id ? String(saved.id) : activeRecordId;
      setActiveRecordId(savedId);
      setForm(courseRecordToForm(saved));
      setSelectedFieldId(String(courseRecordToForm(saved).fieldId ?? ""));
      setSelectedCourseCategoryId(String(courseRecordToForm(saved).courseCategoryId ?? ""));
      setUploadFiles({});

      if (savedId) {
        await courseApi.updateStatus(savedId, true);
      }

      toast.success(hadRecord ? "Course updated." : "Course created.");
      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || "Save failed");
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
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900">Course form</h2>
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
                courseCategoryId={selectedCourseCategoryId}
                courseCategoryOptions={courseCategoryOptions}
                onCourseCategoryChange={handleCourseCategoryChange}
                courseCategoryError={errors.courseCategoryId}
                savedThumbnailUrl={String(form.thumbnail ?? "")}
                savedVideoUrl={String(form.previewVideoUrl ?? "")}
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
                >
                  {panel.id === "instructor" ? (
                    <CourseInstructorPanel
                      instructorId={selectedInstructorId}
                      instructorOptions={instructorOptions}
                      instructors={instructors}
                      loading={loadingInstructors}
                      onInstructorChange={applyInstructorSelection}
                    />
                  ) : null}
                </CollapsibleFormPanel>
              ))}
            </div>

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
