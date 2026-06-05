import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type TestimonialRecord = {
  id?: string;
  text?: string;
  description?: string;
  profileImage?: string;
  initials?: string;
  name?: string;
  role?: string;
  location?: string;
  sortOrder?: number;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const TESTIMONIAL_API_PATH = "/testimonials";

export const TESTIMONIAL_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "initials", label: "Initials", type: "text" },
  { key: "role", label: "Role", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "sortOrder", label: "Sort Order", type: "number" },
  { key: "description", label: "Quote", type: "textarea", required: true },
];

export const TESTIMONIAL_FULL_WIDTH_KEYS = new Set(["description"]);

export const TESTIMONIAL_CREATE_KEYS = [
  "name",
  "initials",
  "role",
  "location",
  "description",
  "sortOrder",
] as const;

export function getTestimonialLabel(item: TestimonialRecord): string {
  return String(item.name ?? item.id ?? "—");
}

export function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

export function getNextSortOrder(items: TestimonialRecord[]): number {
  if (!items.length) return 1;
  const max = Math.max(0, ...items.map((item) => Number(item.sortOrder) || 0));
  return max + 1;
}

function recordTimestamp(item: TestimonialRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortTestimonialsByLatestSaved(items: TestimonialRecord[]): TestimonialRecord[] {
  return [...items].sort((a, b) => {
    const byTime = recordTimestamp(b) - recordTimestamp(a);
    if (byTime !== 0) return byTime;
    return Number(b.sortOrder ?? 0) - Number(a.sortOrder ?? 0);
  });
}
