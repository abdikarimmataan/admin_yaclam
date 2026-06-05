import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  TESTIMONIAL_CREATE_KEYS,
  TESTIMONIAL_FORM_FIELDS,
  deriveInitials,
} from "@/app/testimonials/model/testimonial.model";

export function validateTestimonialForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? TESTIMONIAL_FORM_FIELDS
    : TESTIMONIAL_FORM_FIELDS.filter((f) =>
        TESTIMONIAL_CREATE_KEYS.includes(f.key as (typeof TESTIMONIAL_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim() && f.type !== "boolean") {
      errors[f.key] = `${f.label} is required`;
    }
  });

  if (!editing && !String(form.description ?? "").trim()) {
    errors.description = "Quote is required";
  }

  return errors;
}

export function buildTestimonialPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? TESTIMONIAL_FORM_FIELDS.map((f) => f.key)
    : [...TESTIMONIAL_CREATE_KEYS];

  keysToSave.forEach((key) => {
    const f = TESTIMONIAL_FORM_FIELDS.find((ff) => ff.key === key);
    if (!f) return;
    const raw = form[key];
    let value: unknown = raw;

    if (key === "sortOrder") {
      value = Number.isFinite(Number(raw)) ? Number(raw) : 0;
    } else {
      value = String(raw ?? "");
    }

    setValueByPath(payload, key, value);
  });

  const quote = String(payload.description ?? "").trim();
  if (quote) {
    payload.text = quote;
    payload.description = quote;
  }

  const name = String(payload.name ?? "").trim();
  if (!String(payload.initials ?? "").trim() && name) {
    payload.initials = deriveInitials(name);
  }

  if (!editing) {
    payload.isVisible = true;
  }

  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? TESTIMONIAL_FORM_FIELDS
    : TESTIMONIAL_FORM_FIELDS.filter((f) =>
        TESTIMONIAL_CREATE_KEYS.includes(f.key as (typeof TESTIMONIAL_CREATE_KEYS)[number])
      );
}

export function toTestimonialFormValues(item: Record<string, unknown>): Record<string, unknown> {
  const form: Record<string, unknown> = { ...item };
  const quote = String(form.description ?? form.text ?? "").trim();
  form.description = quote;
  return form;
}
