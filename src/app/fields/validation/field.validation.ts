import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  FIELD_CREATE_KEYS,
  FIELD_FORM_FIELDS,
} from "@/app/fields/model/field.model";

export function validateFieldForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? FIELD_FORM_FIELDS
    : FIELD_FORM_FIELDS.filter((f) =>
        FIELD_CREATE_KEYS.includes(f.key as (typeof FIELD_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim() && f.type !== "boolean") {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildFieldPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? FIELD_FORM_FIELDS.map((f) => f.key)
    : [...FIELD_CREATE_KEYS, "isVisible"];

  keysToSave.forEach((key) => {
    const f = FIELD_FORM_FIELDS.find((ff) => ff.key === key);
    if (!f) return;
    const raw = form[key];
    let value: unknown = raw;
    if (f.type === "number") {
      value = Number.isFinite(Number(raw)) ? Number(raw) : 0;
    } else if (f.type === "boolean") {
      value = !!raw;
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
    ? FIELD_FORM_FIELDS
    : FIELD_FORM_FIELDS.filter((f) =>
        FIELD_CREATE_KEYS.includes(f.key as (typeof FIELD_CREATE_KEYS)[number])
      );
}
