"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ApiError } from "@/config/api";
import { InstructorCourseCurriculumPanel } from "@/app/instructor/courses/components/InstructorCourseCurriculumPanel";
import { instructorCourseApi } from "@/app/instructor/courses/service/instructor-course.service";
import type { CourseModule } from "@/app/courses/model/course.model";
import { buildCurriculumPayload } from "@/app/courses/validation/curriculum.validation";
import { collectCurriculumSaveImpacts } from "@/app/courses/lib/curriculum-lesson-changes";
import { resolveLessonType } from "@/app/courses/lib/lesson-media";
import { confirmCurriculumSave } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

type InstructorCourseCurriculumEditorProps = {
  courseId: string;
  courseTitle: string;
  onBack: () => void;
  onSaved: () => void;
};

function normalizeCurriculum(value: unknown): CourseModule[] {
  if (!Array.isArray(value)) return [];
  return value.map((mod) => ({
    ...(mod as CourseModule),
    lessons: ((mod as CourseModule).lessons ?? []).map((lesson) => ({
      ...lesson,
      lessonType: resolveLessonType(lesson),
      pendingVideoFile: null,
    })),
  }));
}

export function InstructorCourseCurriculumEditor({
  courseId,
  courseTitle,
  onBack,
  onSaved,
}: InstructorCourseCurriculumEditorProps) {
  const [curriculum, setCurriculum] = useState<CourseModule[]>([]);
  const [initialCurriculum, setInitialCurriculum] = useState<CourseModule[]>([]);
  const [lessonIdPrefix, setLessonIdPrefix] = useState("course");
  const [hadCurriculum, setHadCurriculum] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const record = await instructorCourseApi.getById(courseId);
      const existing = normalizeCurriculum(record.curriculum);
      setCurriculum(existing);
      setInitialCurriculum(existing);
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
    const { payload, errors: formErrors, validationItems } = buildCurriculumPayload(curriculum);
    if (!payload) {
      setErrors(formErrors);
      if (validationItems.length) {
        toast.validationErrors(validationItems);
      } else {
        toast.error("Please fix curriculum errors before saving.");
      }
      return;
    }

    const impacts = collectCurriculumSaveImpacts(initialCurriculum, curriculum);
    if (impacts.length > 0) {
      const confirmed = await confirmCurriculumSave(
        [
          "These lesson changes will be applied when you save:",
          "<ul style='text-align:left;margin:0.75rem 0 0;padding-left:1.25rem'>",
          ...impacts.map((line) => `<li style='margin-bottom:0.5rem'>${line}</li>`),
          "</ul>",
        ].join("")
      );
      if (!confirmed) return;
    }

    setSaving(true);
    setErrors({});

    try {
      const saved = await instructorCourseApi.saveCurriculum(courseId, payload);
      const next = normalizeCurriculum(saved.curriculum);
      setCurriculum(next);
      setInitialCurriculum(next);
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
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900">Course curriculum</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading curriculum…
          </div>
        ) : (
          <>
            <InstructorCourseCurriculumPanel
              lessonIdPrefix={lessonIdPrefix}
              curriculum={curriculum}
              errors={errors}
              onChange={(next) => {
                setCurriculum(next);
                setErrors({});
              }}
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
