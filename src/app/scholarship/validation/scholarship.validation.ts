import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { getValueByPath, setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  SCHOLARSHIP_CREATE_KEYS,
  SCHOLARSHIP_FORM_FIELDS,
  SCHOLARSHIP_FUNDING_TYPES,
  SCHOLARSHIP_LIST_KEYS,
} from "@/app/scholarship/model/scholarship.model";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseMonthToken(token: string): number | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber) && asNumber >= 1 && asNumber <= 12) {
    return asNumber;
  }

  const short = trimmed.toLowerCase().slice(0, 3);
  const index = MONTH_LABELS.findIndex((label) => label.toLowerCase() === short);
  return index >= 0 ? index + 1 : null;
}

function parseDeadlineParts(value: unknown): { year: number; month: number; day: number } | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(trimmed)) {
    const date = new Date(trimmed);
    if (!Number.isNaN(date.getTime())) {
      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
      };
    }
  }

  const displayMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (displayMatch) {
    const year = Number(displayMatch[3]);
    const month = parseMonthToken(displayMatch[1]);
    const day = Number(displayMatch[2]);
    if (!month) return null;

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return { year, month, day };
  }

  const slashMatch = trimmed.match(/^(\d{4})[/-]([^/]+)[/-](\d{1,2})$/);
  if (slashMatch) {
    const year = Number(slashMatch[1]);
    const month = parseMonthToken(slashMatch[2]);
    const day = Number(slashMatch[3]);
    if (!month) return null;

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return { year, month, day };
  }

  return null;
}

/** Date input uses YYYY-MM-DD; API accepts ISO or legacy display strings. */
export function deadlineToDateInputValue(value: unknown): string {
  const parts = parseDeadlineParts(value);
  if (!parts) return "";

  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function normalizeDeadlineForApi(value: unknown): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  const parts = parseDeadlineParts(trimmed);
  if (!parts) return null;

  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function formFieldValue(form: Record<string, unknown>, key: string): unknown {
  if (key in form) return form[key];
  return getValueByPath(form, key);
}

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
    if (f.required && f.type !== "boolean") {
      if (!String(formFieldValue(form, f.key) ?? "").trim()) {
        errors[f.key] = `${f.label} is required`;
      }
    }
  });

  const sortRaw = String(formFieldValue(form, "sortOrder") ?? "").trim();
  if (!sortRaw) {
    errors.sortOrder = "Sort order is required";
  } else if (!/^\d+$/.test(sortRaw)) {
    errors.sortOrder = "Sort order must be a whole number";
  }

  const deadlineRaw = String(formFieldValue(form, "deadline") ?? "").trim();
  if (deadlineRaw && normalizeDeadlineForApi(deadlineRaw) === null) {
    errors.deadline = "Enter a valid deadline date";
  }

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
    const raw = formFieldValue(form, key);
    let value: unknown = raw;

    if (SCHOLARSHIP_LIST_KEYS.includes(key as (typeof SCHOLARSHIP_LIST_KEYS)[number])) {
      value = parseStringList(raw);
    } else if (key === "funding") {
      value = normalizeFunding(raw);
    } else if (key === "sortOrder") {
      value = Number.parseInt(String(raw ?? "").trim(), 10);
    } else if (key === "deadline") {
      const normalized = normalizeDeadlineForApi(raw);
      value = normalized ?? "";
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

  payload.flag = String(formFieldValue(form, "flag") ?? "");

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

  if (form.sortOrder != null && form.sortOrder !== "") {
    form.sortOrder = String(form.sortOrder);
  }

  if (form.deadline != null && form.deadline !== "") {
    form.deadline = deadlineToDateInputValue(form.deadline);
  }

  return form;
}
