import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type InstructorRoleRef = {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
};

export type InstructorRecord = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  bio?: string;
  instructorRoleId?: string | InstructorRoleRef | null;
  status?: "active" | "inactive" | string;
  created_at?: string;
  updated_at?: string;
};

export const INSTRUCTOR_API_PATH = "/instructor";

export const INSTRUCTOR_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "email", label: "Email", type: "text", required: true },
  { key: "password", label: "Password", type: "text", required: true },
  { key: "phone", label: "Phone", type: "text" },
  { key: "photo", label: "Photo", type: "text" },
  { key: "bio", label: "Bio", type: "textarea" },
  { key: "instructorRoleId", label: "Role", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

export const INSTRUCTOR_CREATE_KEYS = [
  "name",
  "email",
  "password",
  "phone",
  "photo",
  "bio",
  "instructorRoleId",
] as const;

export const INSTRUCTOR_UPDATE_KEYS = [
  "name",
  "email",
  "password",
  "phone",
  "photo",
  "bio",
  "instructorRoleId",
  "status",
] as const;

export function getInstructorLabel(item: InstructorRecord): string {
  return String(item.name ?? item.email ?? item.id ?? "—");
}

export function getInstructorRecordId(item: InstructorRecord | null | undefined): string {
  if (!item) return "";
  const raw = item as InstructorRecord & { _id?: string };
  return String(item.id ?? raw._id ?? "").trim();
}

export function getInstructorRoleName(item: InstructorRecord): string {
  const role = item.instructorRoleId;
  if (!role) return "—";
  if (typeof role === "object") return String(role.name ?? "—");
  return "—";
}

export function resolveInstructorRoleId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && value !== null) {
    const ref = value as InstructorRoleRef;
    return String(ref.id ?? ref._id ?? "").trim();
  }
  return "";
}
