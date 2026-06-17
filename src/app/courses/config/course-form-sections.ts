import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { COURSE_FORM_FIELDS } from "@/app/courses/model/course.model";

export type CourseFormPanel = {
  id: string;
  title: string;
  description?: string;
  fieldKeys: string[];
};

export const COURSE_FORM_PANELS: CourseFormPanel[] = [
  {
    id: "basic",
    title: "Basic information",
    description: "Title and descriptions",
    fieldKeys: [
      "title",
      "shortDescription",
      "description",
      "level",
      "language",
      "duration",
      "color",
      "badge",
      "certificate",
      "access",
    ],
  },
  {
    id: "overview",
    title: "Overview",
    description: "Course overview shown on the detail page",
    fieldKeys: ["overview.headline", "overview.description", "overview.outcomes"],
  },
  {
    id: "instructor",
    title: "Instructor",
    fieldKeys: [],
  },
  {
    id: "pricing",
    title: "Pricing",
    fieldKeys: ["price", "originalPrice", "isFree", "isFeatured"],
  },
];

const fieldMap = new Map(COURSE_FORM_FIELDS.map((f) => [f.key, f]));

export function getCoursePanelFields(panel: CourseFormPanel): FormField[] {
  return panel.fieldKeys
    .map((key) => fieldMap.get(key))
    .filter((f): f is FormField => Boolean(f));
}
