import type { FormField } from "@/config/api-modules";
import { pickFormValues, setValueByPath } from "@/lib/cms-utils";
import {
  footerColumnsToPayload,
  normalizeFooterColumns,
  type FooterColumnItem,
} from "@/lib/footer-columns-list";
import { normalizeStatsItems, statsItemsToPayload, type StatItem } from "@/lib/stats-list";
import type { CmsRecord } from "@/model/api";

export function parseBoolText(input: string, fallback = true) {
  if (!input.trim()) return fallback;
  return !["false", "0", "no", "off"].includes(input.trim().toLowerCase());
}

export function toStringList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value.map((v) => String(v ?? "")).join(", ");
}

export function toStatsList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => {
      const row = v as { value?: string; label?: string; isVisible?: boolean };
      return `${row.value ?? ""}|${row.label ?? ""}|${row.isVisible !== false}`;
    })
    .join("\n");
}

export function toLinkList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => {
      const row = v as { label?: string; url?: string; isVisible?: boolean };
      return `${row.label ?? ""}|${row.url ?? ""}|${row.isVisible !== false}`;
    })
    .join("\n");
}

export function toPaymentList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => {
      const row = v as { name?: string; icon?: string; isVisible?: boolean };
      return `${row.name ?? ""}|${row.icon ?? ""}|${row.isVisible !== false}`;
    })
    .join("\n");
}

export function toStepsList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => {
      const row = v as {
        title?: string;
        description?: string;
        order?: number;
        isVisible?: boolean;
      };
      return `${row.title ?? ""}|${row.description ?? ""}|${row.order ?? 0}|${row.isVisible !== false}`;
    })
    .join("\n");
}

function sanitizeFieldValue(value: unknown, field: FormField): unknown {
  if (field.type === "boolean") {
    if (typeof value === "boolean") return value;
    if (value === "true" || value === 1 || value === "1") return true;
    if (value === "false" || value === 0 || value === "0") return false;
    return false;
  }
  if (field.type === "number") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  if (
    field.type === "statsList" ||
    field.type === "footerColumnsList" ||
    field.type === "linkList" ||
    field.type === "paymentList" ||
    field.type === "stepsList"
  ) {
    return value;
  }
  if (field.type === "stringList") {
    if (Array.isArray(value)) return value.map((v) => String(v ?? "")).join(", ");
    if (value == null) return "";
    if (typeof value === "object") return "";
    return String(value);
  }
  if (value == null) return "";
  if (typeof value === "object") return "";
  return String(value);
}

export function recordToFormValues(
  item: CmsRecord | null,
  fields: FormField[]
): Record<string, unknown> {
  try {
    const keys = fields.map((f) => f.key);
    const initial = pickFormValues(item, keys);
    fields.forEach((f) => {
      initial[f.key] = sanitizeFieldValue(initial[f.key], f);
      if (f.type === "statsList") initial[f.key] = normalizeStatsItems(initial[f.key]);
      if (f.type === "footerColumnsList") {
        initial[f.key] = normalizeFooterColumns(initial[f.key]);
      }
      if (f.type === "linkList") initial[f.key] = toLinkList(initial[f.key]);
      if (f.type === "paymentList") initial[f.key] = toPaymentList(initial[f.key]);
      if (f.type === "stepsList") initial[f.key] = toStepsList(initial[f.key]);
      if (f.type === "stringList" && typeof initial[f.key] !== "string") {
        initial[f.key] = toStringList(initial[f.key]);
      }
    });
    return initial;
  } catch {
    return emptyFormValues(fields);
  }
}

export function emptyFormValues(fields: FormField[]): Record<string, unknown> {
  const keys = fields.map((f) => f.key);
  const initial = pickFormValues(null, keys);
  fields.forEach((f) => {
    if (f.type === "statsList" || f.type === "footerColumnsList") initial[f.key] = [];
    else if (
      f.type === "linkList" ||
      f.type === "paymentList" ||
      f.type === "stepsList" ||
      f.type === "stringList"
    ) {
      initial[f.key] = "";
    }
    if (f.type === "boolean") initial[f.key] = false;
  });
  return initial;
}

export function buildFormPayload(
  form: Record<string, unknown>,
  fields: FormField[]
): { payload: Record<string, unknown> | null; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  fields.forEach((f) => {
    if (f.required && !String(form[f.key] ?? "").trim() && f.type !== "boolean") {
      errors[f.key] = `${f.label} is required`;
    }
    if (
      (f.type === "linkList" ||
        f.type === "paymentList" ||
        f.type === "stepsList") &&
      String(form[f.key] ?? "").trim()
    ) {
      const lines = String(form[f.key]).split("\n").filter((l) => l.trim());
      const requiredParts =
        f.type === "stepsList" ? 4 : f.type === "paymentList" ? 3 : 3;
      const badLine = lines.find((l) => l.split("|").length < requiredParts);
      if (badLine) errors[f.key] = `${f.label} has invalid line format`;
    }
  });

  if (Object.keys(errors).length) {
    return { payload: null, errors };
  }

  const payload: Record<string, unknown> = {};
  fields.forEach((f) => {
    const raw = form[f.key];
    let value: unknown = raw;
    if (f.type === "number") {
      const num = Number(raw);
      value = Number.isFinite(num) ? num : 0;
    } else if (f.type === "stringList") {
      value = String(raw ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      } else if (f.type === "statsList") {
        if (Array.isArray(raw)) {
          value = statsItemsToPayload(raw as StatItem[]);
        } else {
          value = statsItemsToPayload(normalizeStatsItems(raw));
        }
      } else if (f.type === "footerColumnsList") {
        if (Array.isArray(raw)) {
          value = footerColumnsToPayload(raw as FooterColumnItem[]);
        } else {
          value = footerColumnsToPayload(normalizeFooterColumns(raw));
        }
      } else if (f.type === "linkList") {
      value = String(raw ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const [label = "", url = "", visible = "true"] = line.split("|");
          return { label: label.trim(), url: url.trim(), isVisible: parseBoolText(visible, true) };
        });
    } else if (f.type === "paymentList") {
      value = String(raw ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const [name = "", icon = "", visible = "true"] = line.split("|");
          return { name: name.trim(), icon: icon.trim(), isVisible: parseBoolText(visible, true) };
        });
    } else if (f.type === "stepsList") {
      value = String(raw ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = "", description = "", order = "0", visible = "true"] =
            line.split("|");
          return {
            title: title.trim(),
            description: description.trim(),
            order: Number(order) || 0,
            isVisible: parseBoolText(visible, true),
          };
        });
    } else if (f.type === "text" || f.type === "textarea" || f.type === "email") {
      value = String(raw ?? "");
    } else if (f.type === "boolean") {
      value = !!raw;
    }

    if (value !== undefined) {
      setValueByPath(payload, f.key, value);
    }
  });

  return { payload, errors };
}
