import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type DisciplineRecord = {
  id?: string;
  name?: string;
  created_by?: string;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const DISCIPLINE_API_PATH = "/university_disciplines";

export const DISCIPLINE_FORM_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "e.g. Computing & IT",
    hint: "Discipline grouping on /universities (maps to program.field). Examples: Computing & IT, Health & Medicine, Engineering.",
  },
];

export const DISCIPLINE_CREATE_KEYS = ["name"] as const;

export function getDisciplineLabel(item: DisciplineRecord): string {
  return String(item.name ?? item.id ?? "—");
}

function recordTimestamp(item: DisciplineRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortDisciplinesByLatestSaved(items: DisciplineRecord[]): DisciplineRecord[] {
  return [...items].sort((a, b) => recordTimestamp(b) - recordTimestamp(a));
}
