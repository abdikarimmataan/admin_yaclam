"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ApiError } from "@/config/api";
import { CourseResourcesPanel } from "@/app/courses/components/CourseResourcesPanel";
import type { CourseResourceFormRow } from "@/app/courses/model/course.model";
import { courseApi } from "@/app/courses/service/course.service";
import { buildResourcesPayload } from "@/app/courses/validation/resources.validation";
import { toast } from "@/shared/utils/toast";

type CourseResourcesEditorProps = {
  courseId: string;
  courseTitle: string;
  onBack: () => void;
  onSaved: () => void;
};

function normalizeResources(value: unknown): CourseResourceFormRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => ({
    ...(row as CourseResourceFormRow),
    pendingFile: null,
  }));
}

export function CourseResourcesEditor({
  courseId,
  courseTitle,
  onBack,
  onSaved,
}: CourseResourcesEditorProps) {
  const [resources, setResources] = useState<CourseResourceFormRow[]>([]);
  const [resourceIdPrefix, setResourceIdPrefix] = useState("course");
  const [hadResources, setHadResources] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const record = await courseApi.getById(courseId);
      const existing = normalizeResources(record.resources);
      setResources(existing);
      setHadResources(existing.length > 0);
      setResourceIdPrefix(String(record.id ?? courseId).trim() || courseId);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const { payload, errors: formErrors } = buildResourcesPayload(resources);
    if (!payload) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const saved = await courseApi.saveResources(courseId, payload);
      const next = normalizeResources(saved.resources);
      setResources(next);
      setHadResources(next.length > 0);
      toast.success(hadResources ? "Resources updated." : "Resources saved.");
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
        <h1 className="text-xl font-bold text-gray-900">Resources — {courseTitle}</h1>
      </div>

      <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900">Course resources</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading resources…
          </div>
        ) : (
          <>
            <CourseResourcesPanel
              resourceIdPrefix={resourceIdPrefix}
              resources={resources}
              errors={errors}
              onChange={setResources}
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
                  "Save resources"
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
