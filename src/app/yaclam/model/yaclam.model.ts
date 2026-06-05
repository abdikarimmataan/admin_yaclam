import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type YaclamRecord = {
  id?: string;
  icon?: string;
  title?: string;
  description?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

export const YACLAM_API_PATH = "/why_yaclam";

export const YACLAM_FORM_FIELDS: FormField[] = [
  { key: "icon", label: "Icon", type: "text" },
  { key: "title", label: "Title", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "sortOrder", label: "Sort Order", type: "number" },
  { key: "isVisible", label: "Visible", type: "boolean" },
];

export const YACLAM_CREATE_KEYS = ["icon", "title", "description", "sortOrder"] as const;

export function getYaclamLabel(item: YaclamRecord): string {
  return String(item.title ?? item.id ?? "—");
}

export function getNextSortOrder(items: YaclamRecord[]): number {
  if (!items.length) return 1;
  const max = Math.max(0, ...items.map((item) => Number(item.sortOrder) || 0));
  return max + 1;
}
