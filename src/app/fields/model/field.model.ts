import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type FieldRecord = {
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

export const DUPLICATE_SORT_ORDER_TOOLTIP =
  "Duplicate sort order. This field will not appear on the homepage.";

export function getDuplicateSortOrders(items: FieldRecord[]): Set<number> {
  const counts = new Map<number, number>();

  for (const item of items) {
    if (item.sortOrder == null || !Number.isFinite(Number(item.sortOrder))) continue;
    const order = Number(item.sortOrder);
    counts.set(order, (counts.get(order) ?? 0) + 1);
  }

  const duplicates = new Set<number>();
  counts.forEach((count, order) => {
    if (count > 1) duplicates.add(order);
  });

  return duplicates;
}

export const FIELD_API_PATH = "/fields";

export const FIELD_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "icon", label: "Icon", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "sortOrder", label: "Sort Order", type: "text" },
  { key: "isVisible", label: "Visible", type: "boolean" },
];

export const FIELD_CREATE_KEYS = ["name", "icon", "description", "sortOrder"] as const;

export function getNextFieldSortOrderSuggestion(items: FieldRecord[]): string {
  if (items.length === 0) return "1";

  const max = items.reduce((acc, item) => {
    const n = Number(item.sortOrder);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);

  return String(max + 1);
}

export function getFieldLabel(item: FieldRecord): string {
  return String(item.name ?? item.id ?? "—");
}
