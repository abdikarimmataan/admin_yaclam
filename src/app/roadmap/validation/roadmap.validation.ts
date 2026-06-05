import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath, getValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  ROADMAP_CREATE_KEYS,
  ROADMAP_DEMAND_LEVELS,
  ROADMAP_FORM_FIELDS,
} from "@/app/roadmap/model/roadmap.model";

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

function parseTimeToJobReadyParts(value: unknown): { year: number; month: number; day: number } | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{4})[/-]([^/]+)[/-](\d{1,2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = parseMonthToken(match[2]);
  const day = Number(match[3]);
  if (!month) return null;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return { year, month, day };
}

function parseSkills(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBoolText(value: string, fallback: boolean): boolean {
  const v = value.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return fallback;
}

function parseSteps(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw
      .map((row, index) => {
        const step = row as {
          title?: string;
          detail?: string;
          description?: string;
          order?: number;
          isVisible?: boolean;
        };
        return {
          title: String(step.title ?? "").trim(),
          detail: String(step.detail ?? step.description ?? "").trim(),
          order: Number.isFinite(Number(step.order)) ? Number(step.order) : index,
          isVisible: step.isVisible !== false,
        };
      })
      .filter((step) => step.title || step.detail);
  }
  if (!String(raw ?? "").trim()) return [];
  return String(raw)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title = "", detail = "", order = "0", visible = "true"] = line.split("|");
      return {
        title: title.trim(),
        detail: detail.trim(),
        order: Number(order) || index,
        isVisible: parseBoolText(visible, true),
      };
    });
}

function normalizeDemand(value: unknown): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "High";
  const match = ROADMAP_DEMAND_LEVELS.find((d) => d.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

/** Backend stores YYYY/MM/DD — date input uses YYYY-MM-DD. */
export function timeToJobReadyToDateInputValue(value: unknown): string {
  const parts = parseTimeToJobReadyParts(value);
  if (!parts) return "";

  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function normalizeTimeToJobReadyForApi(value: unknown): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  const parts = parseTimeToJobReadyParts(trimmed);
  if (!parts) return null;

  return `${String(parts.year).padStart(4, "0")}/${String(parts.month).padStart(2, "0")}/${String(parts.day).padStart(2, "0")}`;
}

function formFieldValue(form: Record<string, unknown>, key: string): unknown {
  if (key in form) return form[key];
  return getValueByPath(form, key);
}

export function validateRoadmapForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const activeFields = editing
    ? ROADMAP_FORM_FIELDS
    : ROADMAP_FORM_FIELDS.filter((f) =>
        ROADMAP_CREATE_KEYS.includes(f.key as (typeof ROADMAP_CREATE_KEYS)[number])
      );

  activeFields.forEach((f) => {
    if (!f.required || f.type === "boolean") return;
    if (!String(formFieldValue(form, f.key) ?? "").trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  });

  if (Array.isArray(form.steps) && form.steps.length > 0) {
    const incomplete = (form.steps as { title?: string; detail?: string }[]).find(
      (step) =>
        (String(step.title ?? "").trim() && !String(step.detail ?? "").trim()) ||
        (!String(step.title ?? "").trim() && String(step.detail ?? "").trim())
    );
    if (incomplete) {
      errors.steps = "Each step needs both a title and a description";
    }
  }

  const sortRaw = String(formFieldValue(form, "sortOrder") ?? "").trim();
  if (sortRaw && !/^\d+$/.test(sortRaw)) {
    errors.sortOrder = "Sort order must be a whole number";
  }

  const timeRaw = String(formFieldValue(form, "timeToJobReady") ?? "").trim();
  if (timeRaw && normalizeTimeToJobReadyForApi(timeRaw) === null) {
    errors.timeToJobReady = "Enter a valid date (e.g. 2026/Dec/20)";
  }

  return errors;
}

export function buildRoadmapPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keysToSave = editing
    ? ROADMAP_FORM_FIELDS.map((f) => f.key)
    : [...ROADMAP_CREATE_KEYS];

  keysToSave.forEach((key) => {
    const f = ROADMAP_FORM_FIELDS.find((ff) => ff.key === key);
    if (!f) return;
    const raw = formFieldValue(form, key);
    let value: unknown = raw;
    if (key === "skills") {
      value = parseSkills(raw);
    } else if (key === "demand") {
      value = normalizeDemand(raw);
    } else if (key === "sortOrder") {
      value = Number.parseInt(String(raw ?? "").trim(), 10);
    } else if (key === "timeToJobReady") {
      const normalized = normalizeTimeToJobReadyForApi(raw);
      value = normalized ?? "";
    } else if (key !== "steps") {
      value = String(raw ?? "");
    }
    setValueByPath(payload, key, value);
  });

  payload.steps = parseSteps(form.steps);

  if (!editing) {
    payload.isVisible = true;
    payload.isPublished = true;
    payload.status = true;
    payload.skills = parseSkills(form.skills);
    payload.demand = normalizeDemand(form.demand);
    payload.steps = parseSteps(form.steps);
    payload.ctaButton = {
      label: String(form["ctaButton.label"] ?? "").trim(),
      url: String(form["ctaButton.url"] ?? "").trim(),
      isVisible: true,
    };
  }

  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return editing
    ? ROADMAP_FORM_FIELDS
    : ROADMAP_FORM_FIELDS.filter((f) =>
        ROADMAP_CREATE_KEYS.includes(f.key as (typeof ROADMAP_CREATE_KEYS)[number])
      );
}

export function toRoadmapFormValues(item: Record<string, unknown>): Record<string, unknown> {
  const form: Record<string, unknown> = { ...item };
  if (Array.isArray(form.skills)) {
    form.skills = form.skills.map((s) => String(s ?? ""));
  } else if (typeof form.skills === "string" && form.skills.trim()) {
    form.skills = form.skills.split(",").map((s) => s.trim());
  } else {
    form.skills = [];
  }
  if (Array.isArray(form.steps)) {
    form.steps = form.steps.map((v, i) => {
      const row = v as {
        title?: string;
        detail?: string;
        description?: string;
        order?: number;
        isVisible?: boolean;
      };
      return {
        title: String(row.title ?? ""),
        detail: String(row.detail ?? row.description ?? ""),
        order: Number.isFinite(Number(row.order)) ? Number(row.order) : i,
        isVisible: row.isVisible !== false,
      };
    });
  } else {
    form.steps = [];
  }
  form.timeToJobReady = timeToJobReadyToDateInputValue(form.timeToJobReady);
  return form;
}
