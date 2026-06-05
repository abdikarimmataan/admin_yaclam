import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  BLOG_CREATE_KEYS,
  BLOG_FORM_FIELDS,
} from "@/app/blog/model/blog.model";

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
  return form;
}
