import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  BLOG_CREATE_KEYS,
  BLOG_FORM_FIELDS,
} from "@/app/blog/model/blog.model";

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

function parsePublishedDateParts(value: unknown): { year: number; month: number; day: number } | null {
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
export function publishedDateToDateInputValue(value: unknown): string {
  const parts = parsePublishedDateParts(value);
  if (!parts) return "";

  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function normalizePublishedDateForApi(value: unknown): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  const parts = parsePublishedDateParts(trimmed);
  if (!parts) return null;

  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t ?? "").trim()).filter(Boolean);
  }
  return String(raw ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function validateBlogForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? BLOG_FORM_FIELDS
    : BLOG_FORM_FIELDS.filter((f) =>
        BLOG_CREATE_KEYS.includes(f.key as (typeof BLOG_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  if (!editing && !String(form.categoryId ?? "").trim()) {
    errors.categoryId = "Category is required";
  }

  const publishedRaw = String(form.publishedDate ?? "").trim();
  if (publishedRaw && normalizePublishedDateForApi(publishedRaw) === null) {
    errors.publishedDate = "Enter a valid published date";
  }

  return errors;
}

export function buildBlogPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? BLOG_FORM_FIELDS.map((f) => f.key)
    : [...BLOG_CREATE_KEYS];

  keysToSave.forEach((key) => {
    const f = BLOG_FORM_FIELDS.find((ff) => ff.key === key);
    if (!f) return;
    const raw = form[key];
    let value: unknown = raw;

    if (key === "readTime") {
      value = Number.isFinite(Number(raw)) ? Number(raw) : 0;
    } else if (key === "publishedDate") {
      const normalized = normalizePublishedDateForApi(raw);
      value = normalized ?? "";
    } else if (key === "tags") {
      value = parseTags(raw);
    } else if (key === "content") {
      value = String(raw ?? "").trim();
    } else {
      value = String(raw ?? "");
    }

    setValueByPath(payload, key, value);
  });

  const content = String(payload.content ?? "").trim();
  if (content) {
    payload.content = content;
  }

  if (!editing) {
    payload.status = "draft";
    payload.isVisible = true;
  }

  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? BLOG_FORM_FIELDS
    : BLOG_FORM_FIELDS.filter((f) =>
        BLOG_CREATE_KEYS.includes(f.key as (typeof BLOG_CREATE_KEYS)[number])
      );
}

export function toBlogFormValues(item: Record<string, unknown>): Record<string, unknown> {
  const form: Record<string, unknown> = { ...item };
  const body = form.body;
  if (!form.content && Array.isArray(body)) {
    form.content = body.map((p) => String(p)).filter(Boolean).join("\n\n");
  }
  if (form.tags && !Array.isArray(form.tags)) {
    form.tags = parseTags(form.tags);
  }
  const categoryId = form.categoryId;
  if (categoryId && typeof categoryId === "object") {
    form.categoryId = String((categoryId as { id?: string }).id ?? "");
  }
  if (!form.publishedDate && form.date) {
    form.publishedDate = form.date;
  }

  if (form.publishedDate != null && form.publishedDate !== "") {
    form.publishedDate = publishedDateToDateInputValue(form.publishedDate);
  }

  return form;
}
