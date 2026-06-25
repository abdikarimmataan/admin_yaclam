import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  UNIVERSITY_BASIC_FORM_FIELDS,
  UNIVERSITY_CREATE_KEYS,
} from "@/app/university/model/university.model";

export function validateUniversityForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = UNIVERSITY_BASIC_FORM_FIELDS;

  activeFields.forEach((f) => {
    if (f.key === "countryId" || f.key === "locationId") {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        errors[f.key] = `${f.label} is required`;
      }
      return;
    }
    if (f.required && !String(form[f.key] ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  void editing;
  return errors;
}

export function buildUniversityPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = [...UNIVERSITY_CREATE_KEYS];

  keysToSave.forEach((key) => {
    if (key === "countryId") return;
    if (key === "locationId") {
      setValueByPath(payload, key, String(form[key] ?? "").trim());
      return;
    }
    setValueByPath(payload, key, String(form[key] ?? "").trim());
  });

  if (!editing) {
    payload.isVisible = true;
    payload.isPublished = true;
  }

  return payload;
}

export function getModalFields(_editing: boolean): FormField[] {
  return UNIVERSITY_BASIC_FORM_FIELDS;
}
