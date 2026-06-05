import { toast } from "@/shared/utils/toast";

export type FormFieldLike = { key: string; label: string };

export type ValidationErrorItem = {
  key: string;
  label: string;
  message: string;
};

export type FormPanelLike = {
  title: string;
  fieldKeys: string[];
};

export function formFieldDomId(key: string): string {
  return `form-field-${key.replace(/\./g, "--")}`;
}

export function orderedValidationErrors(
  errors: Record<string, string>,
  fields: FormFieldLike[],
  panels?: FormPanelLike[]
): ValidationErrorItem[] {
  const panelByField = new Map<string, string>();
  panels?.forEach((panel) => {
    panel.fieldKeys.forEach((key) => panelByField.set(key, panel.title));
  });

  const ordered: ValidationErrorItem[] = [];
  const seen = new Set<string>();

  for (const field of fields) {
    const message = errors[field.key];
    if (!message) continue;
    const section = panelByField.get(field.key);
    ordered.push({
      key: field.key,
      label: section ? `${section} — ${field.label}` : field.label,
      message,
    });
    seen.add(field.key);
  }

  for (const [key, message] of Object.entries(errors)) {
    if (seen.has(key)) continue;
    const field = fields.find((f) => f.key === key);
    const section = panelByField.get(key);
    const label = field?.label ?? key;
    ordered.push({
      key,
      label: section ? `${section} — ${label}` : label,
      message,
    });
  }

  return ordered;
}

export function scrollToFormField(key: string) {
  const el = document.getElementById(formFieldDomId(key));
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  const focusable = el.querySelector<HTMLElement>(
    "input:not([type='hidden']), textarea, select, button[role='combobox'], [tabindex]:not([tabindex='-1'])"
  );
  focusable?.focus({ preventScroll: true });
}

export function queueScrollToFirstFormError(items: ValidationErrorItem[], delayMs = 200) {
  if (!items.length) return;
  window.setTimeout(() => scrollToFormField(items[0].key), delayMs);
}

export function applyFormValidationFeedback(
  errors: Record<string, string>,
  fields: FormFieldLike[],
  options?: { panels?: FormPanelLike[]; scrollDelayMs?: number }
) {
  const items = orderedValidationErrors(errors, fields, options?.panels);
  if (!items.length) return;

  toast.validationErrors(items);
  queueScrollToFirstFormError(items, options?.scrollDelayMs ?? 250);
}

export function clearFieldError(
  errors: Record<string, string>,
  key: string
): Record<string, string> {
  if (!errors[key]) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
}
