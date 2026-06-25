import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  UNIVERSITY_LOCATION_CREATE_KEYS,
  UNIVERSITY_LOCATION_FORM_FIELDS,
} from "@/app/university-location/model/university-location.model";

export function validateUniversityLocationForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? UNIVERSITY_LOCATION_FORM_FIELDS
    : UNIVERSITY_LOCATION_FORM_FIELDS.filter((f) =>
        UNIVERSITY_LOCATION_CREATE_KEYS.includes(f.key as (typeof UNIVERSITY_LOCATION_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildUniversityLocationPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? UNIVERSITY_LOCATION_FORM_FIELDS.map((f) => f.key)
    : [...UNIVERSITY_LOCATION_CREATE_KEYS];

  keysToSave.forEach((key) => {
    setValueByPath(payload, key, String(form[key] ?? "").trim());
  });

  if (!editing) payload.isVisible = true;
  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? UNIVERSITY_LOCATION_FORM_FIELDS
    : UNIVERSITY_LOCATION_FORM_FIELDS.filter((f) =>
        UNIVERSITY_LOCATION_CREATE_KEYS.includes(f.key as (typeof UNIVERSITY_LOCATION_CREATE_KEYS)[number])
      );
}
