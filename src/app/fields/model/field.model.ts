import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type FieldRecord = {
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

export const FIELD_API_PATH = "/fields";

export const FIELD_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "icon", label: "Icon", type: "text" },
  { key: "sortOrder", label: "Sort Order", type: "number" },
  { key: "isVisible", label: "Visible", type: "boolean" },
];

export const FIELD_CREATE_KEYS = [
  "name",
  "description",
  "icon",
  "sortOrder",
] as const;

export function getFieldLabel(item: FieldRecord): string {
  return String(item.name ?? item.id ?? "—");
}
