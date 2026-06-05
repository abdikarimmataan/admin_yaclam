import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type PractitionerRecord = {
  id?: string;
  initials?: string;
  name?: string;
  role?: string;
  bio?: string;
  coursesCount?: number;
  studentsCount?: string;
  color?: string;
  sortOrder?: number;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const PRACTITIONER_API_PATH = "/practitioners";

export const DUPLICATE_SORT_ORDER_TOOLTIP =
  "Duplicate sort order. This practitioner will not appear on the homepage.";

export function getDuplicateSortOrders(items: PractitionerRecord[]): Set<number> {
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

export const PRACTITIONER_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "initials", label: "Initials", type: "text" },
  { key: "role", label: "Role", type: "text" },
  { key: "coursesCount", label: "Courses Count", type: "number" },
  { key: "studentsCount", label: "Students Count", type: "text" },
  { key: "color", label: "Color", type: "text" },
  { key: "sortOrder", label: "Sort Order", type: "text", required: true },
  { key: "bio", label: "Bio", type: "textarea" },
];

export const PRACTITIONER_FULL_WIDTH_KEYS = new Set(["bio"]);

export const PRACTITIONER_CREATE_KEYS = [
  "name",
  "initials",
  "role",
  "bio",
  "coursesCount",
  "studentsCount",
  "color",
  "sortOrder",
] as const;

export function getPractitionerLabel(item: PractitionerRecord): string {
  return String(item.name ?? item.id ?? "—");
}

export function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

export function getNextPractitionerSortOrderSuggestion(items: PractitionerRecord[]): string {
  if (items.length === 0) return "1";

  const max = items.reduce((acc, item) => {
    const n = Number(item.sortOrder);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);

  return String(max + 1);
}

function recordTimestamp(item: PractitionerRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortPractitionersByLatestSaved(
  items: PractitionerRecord[]
): PractitionerRecord[] {
  return [...items].sort((a, b) => {
    const byTime = recordTimestamp(b) - recordTimestamp(a);
    if (byTime !== 0) return byTime;
    return Number(b.sortOrder ?? 0) - Number(a.sortOrder ?? 0);
  });
}
