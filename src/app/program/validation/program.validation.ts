import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import { PROGRAM_CREATE_KEYS, PROGRAM_FORM_FIELDS } from "@/app/program/model/program.model";

export function validateProgramForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? PROGRAM_FORM_FIELDS
    : PROGRAM_FORM_FIELDS.filter((f) =>
        PROGRAM_CREATE_KEYS.includes(f.key as (typeof PROGRAM_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildProgramPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? PROGRAM_FORM_FIELDS.map((f) => f.key)
    : [...PROGRAM_CREATE_KEYS];

  keysToSave.forEach((key) => {
    if (key === "disciplineId") {
      const value = String(form[key] ?? "").trim();
      setValueByPath(payload, key, value || null);
      return;
    }
    setValueByPath(payload, key, String(form[key] ?? "").trim());
  });

  if (!editing) payload.isVisible = true;
  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? PROGRAM_FORM_FIELDS
    : PROGRAM_FORM_FIELDS.filter((f) =>
        PROGRAM_CREATE_KEYS.includes(f.key as (typeof PROGRAM_CREATE_KEYS)[number])
      );
}
