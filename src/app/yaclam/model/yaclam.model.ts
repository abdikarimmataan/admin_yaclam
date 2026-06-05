import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type YaclamRecord = {
  id?: string;
  icon?: string;
  title?: string;
  description?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

export const DUPLICATE_SORT_ORDER_TOOLTIP =
  "Duplicate sort order. This item will not appear on the homepage.";

export function getDuplicateSortOrders(items: YaclamRecord[]): Set<number> {
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

export const YACLAM_API_PATH = "/why_yaclam";

export const YACLAM_FORM_FIELDS: FormField[] = [
  { key: "icon", label: "Icon", type: "text" },
  { key: "title", label: "Title", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "sortOrder", label: "Sort Order", type: "text" },
  { key: "isVisible", label: "Visible", type: "boolean" },
];

export const YACLAM_CREATE_KEYS = ["icon", "title", "description", "sortOrder"] as const;

export function getNextYaclamSortOrderSuggestion(items: YaclamRecord[]): string {
  if (items.length === 0) return "1";

  const max = items.reduce((acc, item) => {
    const n = Number(item.sortOrder);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);

  return String(max + 1);
}

export function getYaclamLabel(item: YaclamRecord): string {
  return String(item.title ?? item.id ?? "—");
}
