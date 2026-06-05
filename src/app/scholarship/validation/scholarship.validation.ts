import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  SCHOLARSHIP_CREATE_KEYS,
  SCHOLARSHIP_FORM_FIELDS,
  SCHOLARSHIP_FUNDING_TYPES,
  SCHOLARSHIP_LIST_KEYS,
} from "@/app/scholarship/model/scholarship.model";

function parseStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  const text = String(raw ?? "").trim();
  if (!text) return [];
  if (text.includes("\n")) {
    return text.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

function normalizeFunding(value: unknown): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "Full";
  const match = SCHOLARSHIP_FUNDING_TYPES.find(
    (f) => f.toLowerCase() === trimmed.toLowerCase()
  );
  return match ?? trimmed;
}

function normalizeListFormValue(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((s) => String(s ?? ""));
  if (typeof raw === "string" && raw.trim()) {
    return parseStringList(raw);
  }
  return [];
}

export function validateScholarshipForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? SCHOLARSHIP_FORM_FIELDS
    : SCHOLARSHIP_FORM_FIELDS.filter((f) =>
        SCHOLARSHIP_CREATE_KEYS.includes(f.key as (typeof SCHOLARSHIP_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim() && f.type !== "boolean") {
      errors[f.key] = `${f.label} is required`;
    }
  });

  return errors;
}

export function buildScholarshipPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? SCHOLARSHIP_FORM_FIELDS.map((f) => f.key)
    : [...SCHOLARSHIP_CREATE_KEYS];

  keysToSave.forEach((key) => {
    const f = SCHOLARSHIP_FORM_FIELDS.find((ff) => ff.key === key);
    if (!f) return;
    const raw = form[key];
    let value: unknown = raw;

    if (SCHOLARSHIP_LIST_KEYS.includes(key as (typeof SCHOLARSHIP_LIST_KEYS)[number])) {
      value = parseStringList(raw);
    } else if (key === "funding") {
      value = normalizeFunding(raw);
    } else if (key === "sortOrder") {
      value = Number.isFinite(Number(raw)) ? Number(raw) : 0;
    } else if (key !== "benefits" && key !== "eligibility" && key !== "documents") {
      value = String(raw ?? "");
    }

    setValueByPath(payload, key, value);
  });

  const overview = String(payload.overview ?? "").trim();
  if (overview) {
    payload.description = overview;
  }

  const website = String(payload.website ?? "").trim();
  const applicationUrl = String(payload.applicationUrl ?? "").trim();
  if (website && !applicationUrl) {
    payload.applicationUrl = website;
  } else if (applicationUrl && !website) {
    payload.website = applicationUrl;
  }

  if (!editing) {
    payload.isVisible = true;
    payload.isPublished = true;
    payload.isFeatured = false;
    payload.status = true;
    payload.title = String(payload.name ?? "");
    payload.funding = normalizeFunding(form.funding);
    payload.benefits = parseStringList(form.benefits);
    payload.eligibility = parseStringList(form.eligibility);
    payload.documents = parseStringList(form.documents);
  } else if (!String(payload.title ?? "").trim() && payload.name) {
    payload.title = payload.name;
  }

  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? SCHOLARSHIP_FORM_FIELDS
    : SCHOLARSHIP_FORM_FIELDS.filter((f) =>
        SCHOLARSHIP_CREATE_KEYS.includes(f.key as (typeof SCHOLARSHIP_CREATE_KEYS)[number])
      );
}

export function toScholarshipFormValues(
  item: Record<string, unknown>
): Record<string, unknown> {
  const form: Record<string, unknown> = { ...item };

  if (!String(form.overview ?? "").trim() && form.description) {
    form.overview = form.description;
  }

  if (!String(form.website ?? "").trim() && form.applicationUrl) {
    form.website = form.applicationUrl;
  }

  for (const key of SCHOLARSHIP_LIST_KEYS) {
    form[key] = normalizeListFormValue(form[key]);
  }

  return form;
}
