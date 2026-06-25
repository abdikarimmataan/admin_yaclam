import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  DISCIPLINE_CREATE_KEYS,
  DISCIPLINE_FORM_FIELDS,
} from "@/app/discipline/model/discipline.model";

export function validateDisciplineForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? DISCIPLINE_FORM_FIELDS
    : DISCIPLINE_FORM_FIELDS.filter((f) =>
        DISCIPLINE_CREATE_KEYS.includes(f.key as (typeof DISCIPLINE_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildDisciplinePayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? DISCIPLINE_FORM_FIELDS.map((f) => f.key)
    : [...DISCIPLINE_CREATE_KEYS];

  keysToSave.forEach((key) => {
    setValueByPath(payload, key, String(form[key] ?? "").trim());
  });

  if (!editing) payload.isVisible = true;
  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? DISCIPLINE_FORM_FIELDS
    : DISCIPLINE_FORM_FIELDS.filter((f) =>
        DISCIPLINE_CREATE_KEYS.includes(f.key as (typeof DISCIPLINE_CREATE_KEYS)[number])
      );
}
