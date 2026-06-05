import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  YACLAM_CREATE_KEYS,
  YACLAM_FORM_FIELDS,
} from "@/app/yaclam/model/yaclam.model";

export function validateYaclamForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? YACLAM_FORM_FIELDS
    : YACLAM_FORM_FIELDS.filter((f) =>
        YACLAM_CREATE_KEYS.includes(f.key as (typeof YACLAM_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim() && f.type !== "boolean") {
      errors[f.key] = `${f.label} is required`;
    }
  });

  const sortRaw = String(form.sortOrder ?? "").trim();
  if (!sortRaw) {
    errors.sortOrder = "Sort order is required";
  } else if (!/^\d+$/.test(sortRaw)) {
    errors.sortOrder = "Sort order must be a whole number";
  }

  return errors;
}

export function buildYaclamPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? YACLAM_FORM_FIELDS.map((f) => f.key)
    : [...YACLAM_CREATE_KEYS, "isVisible"];

  keysToSave.forEach((key) => {
    const f = YACLAM_FORM_FIELDS.find((ff) => ff.key === key);
    if (!f) return;
    const raw = form[key];
    let value: unknown = raw;
    if (key === "sortOrder") {
      value = Number.parseInt(String(raw ?? "").trim(), 10);
    } else if (f.type === "number") {
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
    if (!String(payload.icon ?? "").trim()) {
      payload.icon = "Globe";
    }
  }

  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? YACLAM_FORM_FIELDS
    : YACLAM_FORM_FIELDS.filter((f) =>
        YACLAM_CREATE_KEYS.includes(f.key as (typeof YACLAM_CREATE_KEYS)[number])
      );
}
