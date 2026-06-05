import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import type { CmsRecord } from "@/config/api";
import {
  buildFormPayload,
  emptyFormValues,
  recordToFormValues,
} from "@/app/frontend/CMS/lib/cms-form";
import {
  COURSE_FORM_FIELDS,
  type CourseModule,
  type CourseRecord,
  getCourseFieldId,
} from "@/app/courses/model/course.model";

function getFormFields(): FormField[] {
  return COURSE_FORM_FIELDS.filter((f) => f.key !== "fieldId");
}

function parseOutcomes(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v ?? "").trim()).filter(Boolean);
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeCurriculum(value: unknown): CourseModule[] {
  if (!Array.isArray(value)) return [];
  return value as CourseModule[];
}

/** Backend Joi schema accepts only known fields; status is set via PATCH /status/:id. */
export function sanitizeCurriculumForApi(curriculum: unknown): CourseModule[] | undefined {
  if (!Array.isArray(curriculum) || curriculum.length === 0) return undefined;

  const modules = curriculum
    .map((raw, moduleIndex) => {
      const mod = raw as CourseModule;
      const title = String(mod.title ?? "").trim();
      const lessons = (mod.lessons ?? [])
        .map((lesson, lessonIndex) => {
          const lessonTitle = String(lesson.title ?? "").trim();
          if (!lessonTitle) return null;
          return {
            id: String(lesson.id ?? `lesson-${moduleIndex + 1}-${lessonIndex + 1}`).trim(),
            title: lessonTitle,
            duration: String(lesson.duration ?? ""),
            free: !!lesson.free,
            videoUrl: String(lesson.videoUrl ?? ""),
            vimeoId: String(lesson.vimeoId ?? ""),
            sortOrder: Number.isFinite(Number(lesson.sortOrder))
              ? Number(lesson.sortOrder)
              : lessonIndex,
            isVisible: lesson.isVisible !== false,
          };
        })
        .filter(Boolean);

      if (!title && lessons.length === 0) return null;

      return {
        title: title || `Module ${moduleIndex + 1}`,
        sortOrder: Number.isFinite(Number(mod.sortOrder)) ? Number(mod.sortOrder) : moduleIndex,
        isVisible: mod.isVisible !== false,
        lessons,
      };
    })
    .filter(Boolean) as CourseModule[];

  return modules.length ? modules : undefined;
}

function sanitizePayloadForBackend(payload: Record<string, unknown>) {
  delete payload.status;
  delete payload.badges;
  delete payload.ctaButton;
  delete payload.wishlistButton;
  delete payload.curriculum;

  if (payload.instructor && typeof payload.instructor === "object") {
    const instructor = { ...(payload.instructor as Record<string, unknown>) };
    const instructorId = String(instructor.instructorId ?? "").trim();
    if (instructorId) instructor.instructorId = instructorId;
    else delete instructor.instructorId;
    payload.instructor = instructor;
  }
}

export function courseRecordToForm(record: CourseRecord | null): Record<string, unknown> {
  if (!record) {
    return {
      ...emptyFormValues(COURSE_FORM_FIELDS),
      isPublished: true,
      isVisible: true,
      status: true,
      certificate: true,
      curriculum: [],
    };
  }

  const form = recordToFormValues(record as CmsRecord, COURSE_FORM_FIELDS);
  const fieldId = getCourseFieldId(record);
  if (fieldId) form.fieldId = fieldId;

  if (record.instructorName && !form["instructor.name"]) {
    form["instructor.name"] = record.instructorName;
  }
  if (record.level && !form["details.skillLevel"]) {
    form["details.skillLevel"] = record.level;
  }
  if (record.language && !form["details.language"]) {
    form["details.language"] = record.language;
  }
  if (record.overview?.outcomes && !form["overview.outcomes"]) {
    form["overview.outcomes"] = record.overview.outcomes.join(", ");
  }

  form.curriculum = normalizeCurriculum(record.curriculum);
  if (form.status === undefined || form.status === "") form.status = record.status !== false;

  return form;
}

export function buildCoursePayload(
  form: Record<string, unknown>,
  editing: boolean
): { payload: Record<string, unknown> | null; errors: Record<string, string> } {
  const { payload, errors } = buildFormPayload(form, getFormFields());
  if (!payload) return { payload: null, errors };

  delete payload.slug;

  const fieldId = String(form.fieldId ?? "").trim();
  if (fieldId) {
    payload.fieldId = fieldId;
  } else if (!editing) {
    return { payload: null, errors: { fieldId: "Field is required" } };
  }

  const overviewHeadline = String(form["overview.headline"] ?? "").trim();
  const overviewDescription = String(form["overview.description"] ?? "").trim();
  const outcomes = parseOutcomes(form["overview.outcomes"]);
  payload.overview = {
    headline: overviewHeadline || "Build smarter, not harder",
    description: overviewDescription || String(payload.description ?? ""),
    outcomes,
  };

  payload.details = {
    skillLevel: String(
      form["details.skillLevel"] ?? payload.level ?? form.level ?? "Beginner"
    ),
    language: String(form["details.language"] ?? payload.language ?? form.language ?? "Somali"),
    durationHours: Number(form["details.durationHours"] ?? payload.durationHours ?? 0),
    lessonCount: Number(form["details.lessonCount"] ?? payload.lessonCount ?? 0),
    certificate: form["details.certificate"] !== false && form.certificate !== false,
    access: String(form["details.access"] ?? payload.access ?? form.access ?? "1 Year"),
  };

  const instructor = {
    instructorId: String(form["instructor.instructorId"] ?? "").trim() || null,
    name: String(form["instructor.name"] ?? payload.instructorName ?? form.instructorName ?? ""),
    role: String(form["instructor.role"] ?? "Practitioner-instructor"),
    bio: String(form["instructor.bio"] ?? ""),
    avatar: String(form["instructor.avatar"] ?? ""),
  };
  payload.instructor = instructor;

  if (instructor.name) {
    payload.instructorName = instructor.name;
  }

  if (!editing) {
    payload.isPublished = form.isPublished !== false;
    payload.isVisible = form.isVisible !== false;
  }

  sanitizePayloadForBackend(payload);

  return { payload, errors: {} };
}
