import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  PRACTITIONER_CREATE_KEYS,
  PRACTITIONER_FORM_FIELDS,
  deriveInitials,
} from "@/app/practitioners/model/practitioner.model";

export function validatePractitionerForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? PRACTITIONER_FORM_FIELDS
    : PRACTITIONER_FORM_FIELDS.filter((f) =>
        PRACTITIONER_CREATE_KEYS.includes(f.key as (typeof PRACTITIONER_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim() && f.type !== "boolean") {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildPractitionerPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? PRACTITIONER_FORM_FIELDS.map((f) => f.key)
    : [...PRACTITIONER_CREATE_KEYS];

  keysToSave.forEach((key) => {
    const f = PRACTITIONER_FORM_FIELDS.find((ff) => ff.key === key);
    if (!f) return;
    const raw = form[key];
    let value: unknown = raw;

    if (key === "coursesCount" || key === "sortOrder") {
      value = Number.isFinite(Number(raw)) ? Number(raw) : 0;
    } else {
      value = String(raw ?? "");
    }

    setValueByPath(payload, key, value);
  });

  const name = String(payload.name ?? "").trim();
  if (!String(payload.initials ?? "").trim() && name) {
    payload.initials = deriveInitials(name);
  }

  if (!editing) {
    payload.isVisible = true;
    if (!String(payload.color ?? "").trim()) {
      payload.color = "#1D4ED8";
    }
  }

  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? PRACTITIONER_FORM_FIELDS
    : PRACTITIONER_FORM_FIELDS.filter((f) =>
        PRACTITIONER_CREATE_KEYS.includes(f.key as (typeof PRACTITIONER_CREATE_KEYS)[number])
      );
}
