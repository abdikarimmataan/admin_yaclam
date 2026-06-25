import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  UNIVERSITY_LANGUAGE_CREATE_KEYS,
  UNIVERSITY_LANGUAGE_FORM_FIELDS,
} from "@/app/university-language/model/university-language.model";

export function validateUniversityLanguageForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? UNIVERSITY_LANGUAGE_FORM_FIELDS
    : UNIVERSITY_LANGUAGE_FORM_FIELDS.filter((f) =>
        UNIVERSITY_LANGUAGE_CREATE_KEYS.includes(f.key as (typeof UNIVERSITY_LANGUAGE_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildUniversityLanguagePayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? UNIVERSITY_LANGUAGE_FORM_FIELDS.map((f) => f.key)
    : [...UNIVERSITY_LANGUAGE_CREATE_KEYS];

  keysToSave.forEach((key) => {
    if (key === "countryId") {
      setValueByPath(payload, key, String(form[key] ?? "").trim());
      return;
    }
    setValueByPath(payload, key, String(form[key] ?? "").trim());
  });

  if (!editing) payload.isVisible = true;
  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? UNIVERSITY_LANGUAGE_FORM_FIELDS
    : UNIVERSITY_LANGUAGE_FORM_FIELDS.filter((f) =>
        UNIVERSITY_LANGUAGE_CREATE_KEYS.includes(f.key as (typeof UNIVERSITY_LANGUAGE_CREATE_KEYS)[number])
      );
}
