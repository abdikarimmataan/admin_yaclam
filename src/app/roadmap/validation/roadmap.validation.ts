import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { setValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import {
  ROADMAP_CREATE_KEYS,
  ROADMAP_DEMAND_LEVELS,
  ROADMAP_FORM_FIELDS,
} from "@/app/roadmap/model/roadmap.model";

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
    if (f.required && !String(form[f.key] ?? "").trim() && f.type !== "boolean") {
      errors[f.key] = `${f.label} is required`;
    }
  });

  if (Array.isArray(form.steps)) {
    const incomplete = (form.steps as { title?: string; detail?: string }[]).find(
      (step) =>
        (String(step.title ?? "").trim() && !String(step.detail ?? "").trim()) ||
        (!String(step.title ?? "").trim() && String(step.detail ?? "").trim())
    );
    if (incomplete) {
      errors.steps = "Each step needs both a title and a description";
    }
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
    const raw = form[key];
    let value: unknown = raw;
    if (key === "skills") {
      value = parseSkills(raw);
    } else if (key === "demand") {
      value = normalizeDemand(raw);
    } else if (key === "months" || key === "sortOrder") {
      value = Number.isFinite(Number(raw)) ? Number(raw) : 0;
    } else if (key !== "steps") {
      value = String(raw ?? "");
    }
    setValueByPath(payload, key, value);
  });

  if (form.steps !== undefined) {
    payload.steps = parseSteps(form.steps);
  }

  if (!editing) {
    payload.isVisible = true;
    payload.isPublished = true;
    payload.status = true;
    payload.skills = parseSkills(form.skills);
    payload.demand = normalizeDemand(form.demand);
    if (!payload.steps) payload.steps = [];
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
  return form;
}
