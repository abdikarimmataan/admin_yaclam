"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ApiError } from "@/config/api";
import { courseApi } from "@/app/courses/service/course.service";
import {
  emptyCurriculumLesson,
  emptyCurriculumModule,
  type CourseLesson,
  type CourseModule,
} from "@/app/courses/model/course.model";
import { FileUploadDropzone } from "@/shared/components/FileUploadDropzone";

type CourseCurriculumPanelProps = {
  courseId: string;
  lessonIdPrefix: string;
  curriculum: CourseModule[];
  errors?: Record<string, string>;
  onChange: (curriculum: CourseModule[]) => void;
};

export function CourseCurriculumPanel({
  courseId,
  lessonIdPrefix,
  curriculum,
  errors = {},
  onChange,
}: CourseCurriculumPanelProps) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const updateModule = (moduleIndex: number, patch: Partial<CourseModule>) => {
    onChange(curriculum.map((mod, i) => (i === moduleIndex ? { ...mod, ...patch } : mod)));
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    patch: Partial<CourseLesson>
  ) => {
    onChange(
      curriculum.map((mod, mi) => {
        if (mi !== moduleIndex) return mod;
        const lessons = (mod.lessons ?? []).map((lesson, li) =>
          li === lessonIndex ? { ...lesson, ...patch } : lesson
        );
        return { ...mod, lessons };
      })
    );
  };

  const addModule = () => {
    onChange([...curriculum, emptyCurriculumModule(curriculum.length)]);
  };

  const removeModule = (moduleIndex: number) => {
    onChange(curriculum.filter((_, i) => i !== moduleIndex));
  };

  const addLesson = (moduleIndex: number) => {
    const mod = curriculum[moduleIndex];
    const lessons = mod?.lessons ?? [];
    onChange(
      curriculum.map((m, i) =>
        i === moduleIndex
          ? {
              ...m,
              lessons: [
                ...lessons,
                emptyCurriculumLesson(moduleIndex, lessons.length, lessonIdPrefix),
              ],
            }
          : m
      )
    );
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    onChange(
      curriculum.map((mod, mi) => {
        if (mi !== moduleIndex) return mod;
        return {
          ...mod,
          lessons: (mod.lessons ?? []).filter((_, li) => li !== lessonIndex),
        };
      })
    );
  };

  const uploadLessonVideo = async (
    moduleIndex: number,
    lessonIndex: number,
    file: File
  ) => {
    const key = `${moduleIndex}-${lessonIndex}`;
    setUploadingKey(key);
    setUploadMessage("");
    try {
      const res = await courseApi.uploadLessonVideo(courseId, moduleIndex, lessonIndex, file);
      const videoUrl = String(res.videoUrl ?? "");
      if (videoUrl) {
        updateLesson(moduleIndex, lessonIndex, { videoUrl });
        if (res.course && typeof res.course === "object") {
          const savedCurriculum = (res.course as { curriculum?: CourseModule[] }).curriculum;
          if (savedCurriculum) onChange(savedCurriculum);
        }
        setUploadMessage("Lesson video uploaded.");
      }
    } catch (err) {
      setUploadMessage((err as ApiError).message || "Lesson video upload failed");
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      {errors._form && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{errors._form}</p>
      )}

      {curriculum.length === 0 && (
        <p className="text-sm text-slate-500">
          No modules yet. Add a module to start building the curriculum.
        </p>
      )}

      {curriculum.map((mod, moduleIndex) => (
        <div
          key={`module-${moduleIndex}`}
          className="rounded-lg border border-gray-200 bg-gray-50/50 p-3"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <div>
                <input
                  value={String(mod.title ?? "")}
                  onChange={(e) => updateModule(moduleIndex, { title: e.target.value })}
                  placeholder="Module title *"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                {errors[`module-${moduleIndex}-title`] && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors[`module-${moduleIndex}-title`]}
                  </p>
                )}
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={String(mod.sortOrder ?? moduleIndex)}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  updateModule(moduleIndex, {
                    sortOrder: raw === "" ? moduleIndex : Number(raw),
                  });
                }}
                placeholder="e.g. 1"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => removeModule(moduleIndex)}
              className="rounded p-1 text-red-500 hover:bg-red-50"
              aria-label="Remove module"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <label className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-gray-700">
            <input
              type="checkbox"
              checked={mod.isVisible !== false}
              onChange={(e) => updateModule(moduleIndex, { isVisible: e.target.checked })}
            />
            Module visible
          </label>

          <div className="space-y-3">
            {(mod.lessons ?? []).map((lesson, lessonIndex) => {
              const uploadKey = `${moduleIndex}-${lessonIndex}`;
              return (
                <div
                  key={lesson.id ?? uploadKey}
                  className="rounded-md border border-gray-200 bg-white p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <input
                        value={String(lesson.title ?? "")}
                        onChange={(e) =>
                          updateLesson(moduleIndex, lessonIndex, { title: e.target.value })
                        }
                        placeholder="Lesson title *"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      {errors[`module-${moduleIndex}-lesson-${lessonIndex}-title`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`module-${moduleIndex}-lesson-${lessonIndex}-title`]}
                        </p>
                      )}
                    </div>
                    <input
                      value={String(lesson.duration ?? "")}
                      onChange={(e) =>
                        updateLesson(moduleIndex, lessonIndex, { duration: e.target.value })
                      }
                      placeholder="Duration (e.g. 12:30)"
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      value={String(lesson.videoUrl ?? "")}
                      onChange={(e) =>
                        updateLesson(moduleIndex, lessonIndex, { videoUrl: e.target.value })
                      }
                      placeholder="Video URL"
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
                    />
                  </div>

                  <div className="mt-2">
                    {String(lesson.videoUrl ?? "").trim() ? (
                      <p className="mb-1.5 text-xs font-medium text-green-700">Video attached</p>
                    ) : null}
                    <FileUploadDropzone
                      size="sm"
                      icon="video"
                      accept="video/mp4,.mp4"
                      file={null}
                      onChange={(file) => {
                        if (file) uploadLessonVideo(moduleIndex, lessonIndex, file);
                      }}
                      labelSuffix="lesson video"
                      helperText="MP4 · max 2GB"
                      maxSizeMb={2048}
                      loading={uploadingKey === uploadKey}
                      disabled={uploadingKey === uploadKey}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!lesson.free}
                        onChange={(e) =>
                          updateLesson(moduleIndex, lessonIndex, { free: e.target.checked })
                        }
                      />
                      Free preview
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={lesson.isVisible !== false}
                        onChange={(e) =>
                          updateLesson(moduleIndex, lessonIndex, {
                            isVisible: e.target.checked,
                          })
                        }
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      onClick={() => removeLesson(moduleIndex, lessonIndex)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove lesson
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => addLesson(moduleIndex)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add lesson
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addModule}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Add module
      </button>

      {uploadMessage && <p className="text-xs text-green-700">{uploadMessage}</p>}
    </div>
  );
}
