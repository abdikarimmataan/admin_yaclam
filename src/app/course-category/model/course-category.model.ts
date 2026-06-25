import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type CourseCategoryRecord = {
  id?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const COURSE_CATEGORY_API_PATH = "/course_categories";

export const COURSE_CATEGORY_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "sortOrder", label: "Sort Order", type: "number" },
];

export const COURSE_CATEGORY_CREATE_KEYS = ["name", "description", "sortOrder"] as const;

export function getCourseCategoryLabel(item: CourseCategoryRecord): string {
  return String(item.name ?? item.id ?? "—");
}

export function getCourseCategoryRecordId(item: CourseCategoryRecord): string {
  const raw = item as CourseCategoryRecord & { _id?: string };
  return String(item.id ?? raw._id ?? "").trim();
}

export function getNextSortOrder(items: CourseCategoryRecord[]): number {
  if (!items.length) return 1;
  const max = Math.max(0, ...items.map((item) => Number(item.sortOrder) || 0));
  return max + 1;
}

function recordTimestamp(item: CourseCategoryRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortCourseCategoriesByLatestSaved(
  items: CourseCategoryRecord[]
): CourseCategoryRecord[] {
  return [...items].sort((a, b) => {
    const byTime = recordTimestamp(b) - recordTimestamp(a);
    if (byTime !== 0) return byTime;
    return Number(b.sortOrder ?? 0) - Number(a.sortOrder ?? 0);
  });
}

export const DEFAULT_COURSE_CATEGORY_NAME = "New & Popular Courses";
