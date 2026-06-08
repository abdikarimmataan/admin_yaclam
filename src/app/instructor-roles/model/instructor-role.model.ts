import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type InstructorRoleRecord = {
  id?: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export const INSTRUCTOR_ROLE_API_PATH = "/instructor_role";

export const INSTRUCTOR_ROLE_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
];

export const INSTRUCTOR_ROLE_CREATE_KEYS = ["name", "description"] as const;

export function getInstructorRoleLabel(item: InstructorRoleRecord): string {
  return String(item.name ?? item.id ?? "—");
}

export function getInstructorRoleId(item: InstructorRoleRecord | null | undefined): string {
  if (!item) return "";
  const raw = item as InstructorRoleRecord & { _id?: string };
  return String(item.id ?? raw._id ?? "").trim();
}
