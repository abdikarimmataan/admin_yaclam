import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type BlogCategoryRecord = {
  id?: string;
  name?: string;
  description?: string;
  color?: string;
  sortOrder?: number;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const BLOG_CATEGORY_API_PATH = "/blog_categories";

export const BLOG_CATEGORY_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "color", label: "Color", type: "text" },
  { key: "sortOrder", label: "Sort Order", type: "number" },
];

export const BLOG_CATEGORY_CREATE_KEYS = ["name", "description", "color", "sortOrder"] as const;

export function getBlogCategoryLabel(item: BlogCategoryRecord): string {
  return String(item.name ?? item.id ?? "—");
}

export function getNextSortOrder(items: BlogCategoryRecord[]): number {
  if (!items.length) return 1;
  const max = Math.max(0, ...items.map((item) => Number(item.sortOrder) || 0));
  return max + 1;
}

function recordTimestamp(item: BlogCategoryRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortBlogCategoriesByLatestSaved(
  items: BlogCategoryRecord[]
): BlogCategoryRecord[] {
  return [...items].sort((a, b) => {
    const byTime = recordTimestamp(b) - recordTimestamp(a);
    if (byTime !== 0) return byTime;
    return Number(b.sortOrder ?? 0) - Number(a.sortOrder ?? 0);
  });
}
