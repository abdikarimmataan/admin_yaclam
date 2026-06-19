import type { CourseLessonFormRow, CourseModule } from "@/app/courses/model/course.model";
import { sanitizeCurriculumForApi } from "@/app/courses/validation/course.validation";
import type { ValidationErrorItem } from "@/shared/utils/form-validation";

export type LessonVideoTarget = {
  moduleIndex: number;
  lessonIndex: number;
  lessonId?: string;
};

export type CurriculumSavePayload = {
  curriculum: CourseModule[];
  lessonVideoTargets: LessonVideoTarget[];
  files: File[];
};

export function lessonHasVideo(lesson: CourseLessonFormRow): boolean {
  return Boolean(String(lesson.videoUrl ?? "").trim() || lesson.pendingVideoFile);
}

export type CurriculumValidationItem = ValidationErrorItem;

export type CurriculumValidationResult = {
  errors: Record<string, string>;
  validationItems: ValidationErrorItem[];
};

export function validateCurriculumForm(curriculum: CourseModule[]): CurriculumValidationResult {
  const errors: Record<string, string> = {};
  const validationItems: ValidationErrorItem[] = [];

  if (curriculum.length === 0) {
    errors._form = "Add at least one module before saving.";
    validationItems.push({
      key: "_form",
      label: "Curriculum",
      message: "Add at least one module before saving.",
    });
  }

  curriculum.forEach((mod, moduleIndex) => {
    const modTitle = String(mod.title ?? "").trim() || `Module ${moduleIndex + 1}`;

    if (!String(mod.title ?? "").trim()) {
      errors[`module-${moduleIndex}-title`] = "Module title is required";
      validationItems.push({
        key: `module-${moduleIndex}-title`,
        label: modTitle,
        message: "Module title is required.",
      });
    }

    const lessons = mod.lessons ?? [];

    if (lessons.length === 0) {
      errors[`module-${moduleIndex}-lessons`] =
        "Each module must have at least one lesson with a video.";
      validationItems.push({
        key: `module-${moduleIndex}-lessons`,
        label: modTitle,
        message: "This module has no lessons. Add a lesson with video or remove the module.",
      });
    }

    lessons.forEach((lesson, lessonIndex) => {
      const lessonTitle = String(lesson.title ?? "").trim() || `Lesson ${lessonIndex + 1}`;

      if (!String(lesson.title ?? "").trim()) {
        errors[`module-${moduleIndex}-lesson-${lessonIndex}-title`] = "Lesson title is required";
        validationItems.push({
          key: `module-${moduleIndex}-lesson-${lessonIndex}-title`,
          label: `${modTitle} › ${lessonTitle}`,
          message: "Lesson title is required.",
        });
      }

      if (!lessonHasVideo(lesson as CourseLessonFormRow)) {
        errors[`module-${moduleIndex}-lesson-${lessonIndex}-video`] =
          "Lesson video is required. Upload a video or remove this lesson.";
        validationItems.push({
          key: `module-${moduleIndex}-lesson-${lessonIndex}-video`,
          label: modTitle,
          message: `"${lessonTitle}" has no video. Upload a video or remove this lesson.`,
        });
      }
    });
  });

  return { errors, validationItems };
}

export function buildCurriculumPayload(curriculum: CourseModule[]): {
  payload: CurriculumSavePayload | null;
  errors: Record<string, string>;
  validationItems: ValidationErrorItem[];
} {
  const { errors, validationItems } = validateCurriculumForm(curriculum);
  if (Object.keys(errors).length > 0) {
    return { payload: null, errors, validationItems };
  }

  const lessonVideoTargets: LessonVideoTarget[] = [];
  const files: File[] = [];

  curriculum.forEach((mod, moduleIndex) => {
    (mod.lessons ?? []).forEach((lesson, lessonIndex) => {
      const row = lesson as CourseLessonFormRow;
      if (!row.pendingVideoFile) return;
      lessonVideoTargets.push({
        moduleIndex,
        lessonIndex,
        lessonId: String(row.id ?? "").trim() || undefined,
      });
      files.push(row.pendingVideoFile);
    });
  });

  const sanitized = sanitizeCurriculumForApi(
    curriculum.map((mod) => ({
      ...mod,
      lessons: (mod.lessons ?? []).map((row) => {
        const { pendingVideoFile: _pending, ...lesson } = row as CourseLessonFormRow;
        return lesson;
      }),
    }))
  );

  return {
    payload: { curriculum: sanitized, lessonVideoTargets, files },
    errors: {},
    validationItems: [],
  };
}
