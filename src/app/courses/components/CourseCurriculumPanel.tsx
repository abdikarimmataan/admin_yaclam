"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import {
  emptyCurriculumLesson,
  emptyCurriculumModule,
  type CourseLessonFormRow,
  type CourseModule,
} from "@/app/courses/model/course.model";
import { FileUploadDropzone } from "@/shared/components/FileUploadDropzone";

type CourseCurriculumPanelProps = {
  lessonIdPrefix: string;
  curriculum: CourseModule[];
  errors?: Record<string, string>;
  onChange: (curriculum: CourseModule[]) => void;
};

export function CourseCurriculumPanel({
  lessonIdPrefix,
  curriculum,
  errors = {},
  onChange,
}: CourseCurriculumPanelProps) {
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({});
  const curriculumRef = useRef(curriculum);
  curriculumRef.current = curriculum;

  const updateCurriculum = (updater: (prev: CourseModule[]) => CourseModule[]) => {
    onChange(updater(curriculumRef.current));
  };

  const updateModule = (moduleIndex: number, patch: Partial<CourseModule>) => {
    updateCurriculum((prev) =>
      prev.map((mod, i) => (i === moduleIndex ? { ...mod, ...patch } : mod))
    );
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    patch: Partial<CourseLessonFormRow>
  ) => {
    updateCurriculum((prev) =>
      prev.map((mod, mi) => {
        if (mi !== moduleIndex) return mod;
        const lessons = (mod.lessons ?? []).map((lesson, li) =>
          li === lessonIndex ? { ...lesson, ...patch } : lesson
        );
        return { ...mod, lessons };
      })
    );
  };

  const addModule = () => {
    updateCurriculum((prev) => [...prev, emptyCurriculumModule(prev.length)]);
  };

  const removeModule = (moduleIndex: number) => {
    updateCurriculum((prev) => prev.filter((_, i) => i !== moduleIndex));
  };

  const addLesson = (moduleIndex: number) => {
    updateCurriculum((prev) => {
      const mod = prev[moduleIndex];
      const lessons = mod?.lessons ?? [];
      return prev.map((m, i) =>
        i === moduleIndex
          ? {
              ...m,
              lessons: [
                ...lessons,
                emptyCurriculumLesson(moduleIndex, lessons.length, lessonIdPrefix),
              ],
            }
          : m
      );
    });
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    updateCurriculum((prev) =>
      prev.map((mod, mi) => {
        if (mi !== moduleIndex) return mod;
        return {
          ...mod,
          lessons: (mod.lessons ?? []).filter((_, li) => li !== lessonIndex),
        };
      })
    );
  };

  const clearLessonVideo = (moduleIndex: number, lessonIndex: number) => {
    updateLesson(moduleIndex, lessonIndex, {
      videoUrl: "",
      pendingVideoFile: null,
    });
    const key = `${moduleIndex}-${lessonIndex}`;
    setResetKeys((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  };

  const pickLessonVideo = (
    moduleIndex: number,
    lessonIndex: number,
    file: File | null
  ) => {
    updateLesson(moduleIndex, lessonIndex, { pendingVideoFile: file });
    const key = `${moduleIndex}-${lessonIndex}`;
    setResetKeys((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));

    if (!file) return;

    // Auto-read duration from the video file
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const totalSeconds = Math.floor(video.duration || 0);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      const formatted = `${mins}:${String(secs).padStart(2, "0")}`;
      updateLesson(moduleIndex, lessonIndex, { duration: formatted });
    };
    video.src = url;
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

          {errors[`module-${moduleIndex}-lessons`] && (
            <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
              {errors[`module-${moduleIndex}-lessons`]}
            </p>
          )}

          <div className="space-y-3">
            {(mod.lessons ?? []).map((lesson, lessonIndex) => {
              const row = lesson as CourseLessonFormRow;
              const uploadKey = `${moduleIndex}-${lessonIndex}`;
              const videoUrl = String(row.videoUrl ?? "").trim();
              const pendingFile = row.pendingVideoFile ?? null;
              const hasSavedVideo = Boolean(videoUrl && !pendingFile);

              return (
                <div
                  key={row.id ?? uploadKey}
                  className="rounded-md border border-gray-200 bg-white p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <input
                        value={String(row.title ?? "")}
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
                    <div className="relative">
                      <input
                        value={String(row.duration ?? "")}
                        readOnly
                        placeholder="Auto from video"
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-default select-none"
                        title="Duration is set automatically from the selected video"
                      />
                      {!row.duration && (
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                          auto
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    {hasSavedVideo ? (
                      <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-medium text-slate-700">Current video</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-slate-900">
                            {videoUrl.split("/").pop()}
                          </span>
                          <button
                            type="button"
                            onClick={() => clearLessonVideo(moduleIndex, lessonIndex)}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            Remove video
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {pendingFile ? (
                      <p className="mb-2 text-xs font-medium text-green-700">
                        New video selected: {pendingFile.name}
                      </p>
                    ) : null}

                    <FileUploadDropzone
                      key={resetKeys[uploadKey] ?? 0}
                      size="sm"
                      icon="video"
                      accept="video/mp4,.mp4"
                      file={pendingFile}
                      onChange={(file) => pickLessonVideo(moduleIndex, lessonIndex, file)}
                      labelSuffix={hasSavedVideo || pendingFile ? "replace video" : "lesson video"}
                      helperText="MP4 · max 2GB · saved when you click Save curriculum"
                      maxSizeMb={2048}
                      error={errors[`module-${moduleIndex}-lesson-${lessonIndex}-video`]}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!row.free}
                        onChange={(e) =>
                          updateLesson(moduleIndex, lessonIndex, { free: e.target.checked })
                        }
                      />
                      Free preview
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={row.isVisible !== false}
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
    </div>
  );
}
