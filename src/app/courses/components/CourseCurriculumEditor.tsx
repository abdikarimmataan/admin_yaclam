"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ApiError } from "@/config/api";
import { CourseCurriculumPanel } from "@/app/courses/components/CourseCurriculumPanel";
import type { CourseModule } from "@/app/courses/model/course.model";
import { courseApi } from "@/app/courses/service/course.service";
import { buildCurriculumPayload } from "@/app/courses/validation/curriculum.validation";
import { toast } from "@/shared/utils/toast";

type CourseCurriculumEditorProps = {
  courseId: string;
  courseTitle: string;
  onBack: () => void;
  onSaved: () => void;
};

function normalizeCurriculum(value: unknown): CourseModule[] {
  if (!Array.isArray(value)) return [];
  return value as CourseModule[];
}

export function CourseCurriculumEditor({
  courseId,
  courseTitle,
  onBack,
  onSaved,
}: CourseCurriculumEditorProps) {
  const [curriculum, setCurriculum] = useState<CourseModule[]>([]);
  const [lessonIdPrefix, setLessonIdPrefix] = useState("course");
  const [hadCurriculum, setHadCurriculum] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const record = await courseApi.getById(courseId);
      const existing = normalizeCurriculum(record.curriculum);
      setCurriculum(existing);
      setHadCurriculum(existing.length > 0);
      setLessonIdPrefix(String(record.id ?? courseId).trim() || courseId);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const { payload, errors: formErrors } = buildCurriculumPayload(curriculum);
    if (!payload) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const saved = await courseApi.saveCurriculum(courseId, payload);
      const next = normalizeCurriculum(saved.curriculum);
      setCurriculum(next);
      setHadCurriculum(next.length > 0);
      toast.success(hadCurriculum ? "Curriculum updated." : "Curriculum created.");
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
        <h1 className="text-xl font-bold text-gray-900">Curriculum — {courseTitle}</h1>
      </div>

      <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-gray-900">Course curriculum</h2>
          {hadCurriculum ? (
            <span className="text-xs font-medium text-green-700">
              Curriculum exists — updates on save
            </span>
          ) : (
            <span className="text-xs font-medium text-amber-700">
              No curriculum yet — creates on save
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading curriculum…
          </div>
        ) : (
          <>
            <CourseCurriculumPanel
              courseId={courseId}
              lessonIdPrefix={lessonIdPrefix}
              curriculum={curriculum}
              errors={errors}
              onChange={setCurriculum}
            />

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
                  "Save curriculum"
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
