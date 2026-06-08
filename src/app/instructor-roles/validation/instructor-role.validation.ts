import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import {
  INSTRUCTOR_ROLE_CREATE_KEYS,
  INSTRUCTOR_ROLE_FORM_FIELDS,
} from "@/app/instructor-roles/model/instructor-role.model";

export function validateInstructorRoleForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? INSTRUCTOR_ROLE_FORM_FIELDS
    : INSTRUCTOR_ROLE_FORM_FIELDS.filter((f) =>
        INSTRUCTOR_ROLE_CREATE_KEYS.includes(f.key as (typeof INSTRUCTOR_ROLE_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildInstructorRolePayload(form: Record<string, unknown>): Record<string, unknown> {
  return {
    name: String(form.name ?? "").trim(),
    description: String(form.description ?? ""),
  };
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? INSTRUCTOR_ROLE_FORM_FIELDS
    : INSTRUCTOR_ROLE_FORM_FIELDS.filter((f) =>
        INSTRUCTOR_ROLE_CREATE_KEYS.includes(f.key as (typeof INSTRUCTOR_ROLE_CREATE_KEYS)[number])
      );
}
