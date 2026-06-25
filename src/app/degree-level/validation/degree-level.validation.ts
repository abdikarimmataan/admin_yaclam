import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  DEGREE_LEVEL_CREATE_KEYS,
  DEGREE_LEVEL_FORM_FIELDS,
} from "@/app/degree-level/model/degree-level.model";

export function validateDegreeLevelForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? DEGREE_LEVEL_FORM_FIELDS
    : DEGREE_LEVEL_FORM_FIELDS.filter((f) =>
        DEGREE_LEVEL_CREATE_KEYS.includes(f.key as (typeof DEGREE_LEVEL_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildDegreeLevelPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? DEGREE_LEVEL_FORM_FIELDS.map((f) => f.key)
    : [...DEGREE_LEVEL_CREATE_KEYS];

  keysToSave.forEach((key) => {
    setValueByPath(payload, key, String(form[key] ?? "").trim());
  });

  if (!editing) payload.isVisible = true;
  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? DEGREE_LEVEL_FORM_FIELDS
    : DEGREE_LEVEL_FORM_FIELDS.filter((f) =>
        DEGREE_LEVEL_CREATE_KEYS.includes(f.key as (typeof DEGREE_LEVEL_CREATE_KEYS)[number])
      );
}
