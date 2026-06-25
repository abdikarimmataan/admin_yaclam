import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  COURSE_CATEGORY_CREATE_KEYS,
  COURSE_CATEGORY_FORM_FIELDS,
} from "@/app/course-category/model/course-category.model";

export function validateCourseCategoryForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? COURSE_CATEGORY_FORM_FIELDS
    : COURSE_CATEGORY_FORM_FIELDS.filter((f) =>
        COURSE_CATEGORY_CREATE_KEYS.includes(f.key as (typeof COURSE_CATEGORY_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildCourseCategoryPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? COURSE_CATEGORY_FORM_FIELDS.map((f) => f.key)
    : [...COURSE_CATEGORY_CREATE_KEYS];

  keysToSave.forEach((key) => {
    const f = COURSE_CATEGORY_FORM_FIELDS.find((ff) => ff.key === key);
    if (!f) return;
    const raw = form[key];
    let value: unknown = raw;
    if (key === "sortOrder") {
      value = Number.isFinite(Number(raw)) ? Number(raw) : 0;
    } else {
      value = String(raw ?? "");
    }
    setValueByPath(payload, key, value);
  });

  if (!editing) {
    payload.isVisible = true;
  }

  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? COURSE_CATEGORY_FORM_FIELDS
    : COURSE_CATEGORY_FORM_FIELDS.filter((f) =>
        COURSE_CATEGORY_CREATE_KEYS.includes(f.key as (typeof COURSE_CATEGORY_CREATE_KEYS)[number])
      );
}
