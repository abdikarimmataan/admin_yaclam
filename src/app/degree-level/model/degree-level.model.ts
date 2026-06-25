import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type DegreeLevelRecord = {
  id?: string;
  name?: string;
  created_by?: string;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const DEGREE_LEVEL_API_PATH = "/university_categories";

export const DEGREE_LEVEL_FORM_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "e.g. Bachelor",
    hint: "Degree level tab on /universities (Bachelor, Master, PhD, etc.). Keep Visible on to show on the website.",
  },
];

export const DEGREE_LEVEL_CREATE_KEYS = ["name"] as const;

export function getDegreeLevelLabel(item: DegreeLevelRecord): string {
  return String(item.name ?? item.id ?? "—");
}

function recordTimestamp(item: DegreeLevelRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortDegreeLevelsByLatestSaved(items: DegreeLevelRecord[]): DegreeLevelRecord[] {
  return [...items].sort((a, b) => recordTimestamp(b) - recordTimestamp(a));
}
