import type { FormField } from "@/app/frontend/CMS/config/api-modules";
import { COURSES_PAGE_MODULE } from "@/app/frontend/CMS/config/api-modules";

export type CmsFormPanel = {
  id: string;
  title: string;
  description?: string;
  fieldKeys: string[];
};

const allFields = COURSES_PAGE_MODULE.formFields ?? [];

function fieldsByKeys(keys: string[]): FormField[] {
  const map = new Map(allFields.map((f) => [f.key, f]));
  return keys.map((k) => map.get(k)).filter((f): f is FormField => Boolean(f));
}

export const COURSE_CMS_PANELS: CmsFormPanel[] = [
  {
    id: "page-copy",
    title: "Page copy",
    description: "Header and listing page text shown on the courses page",
    fieldKeys: ["headerText", "title", "subtitle", "emptyStateText"],
  },
  {
    id: "visibility",
    title: "Visibility",
    fieldKeys: ["isVisible"],
  },
];

export const ALL_COURSE_CMS_FIELDS = allFields;

export function getCourseCmsPanelFields(panel: CmsFormPanel): FormField[] {
  return fieldsByKeys(panel.fieldKeys);
}
