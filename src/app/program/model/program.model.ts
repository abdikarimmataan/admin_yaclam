import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type ProgramRecord = {
  id?: string;
  name?: string;
  disciplineId?: string | { id?: string; name?: string };
  created_by?: string;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

/** Course heading on /universities (maps to programs[].course) */
export const PROGRAM_API_PATH = "/university_programs";

export const PROGRAM_FORM_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "e.g. Computer Science & IT",
    hint: "Study area heading on /universities (maps to program.course). Examples: Computer Science & IT, Medicine, MBA.",
  },
  {
    key: "disciplineId",
    label: "Discipline",
    type: "select",
    hint: "Optional default discipline for this study area.",
  },
];

export const PROGRAM_CREATE_KEYS = ["name", "disciplineId"] as const;

export function getProgramLabel(item: ProgramRecord): string {
  return String(item.name ?? item.id ?? "—");
}

function recordTimestamp(item: ProgramRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortProgramsByLatestSaved(items: ProgramRecord[]): ProgramRecord[] {
  return [...items].sort((a, b) => recordTimestamp(b) - recordTimestamp(a));
}
