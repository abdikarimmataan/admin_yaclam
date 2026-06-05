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
    description: "Title, category, and descriptions",
    fieldKeys: [
      "title",
      "shortDescription",
      "description",
      "category",
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
    fieldKeys: [
      "instructorName",
      "instructor.instructorId",
      "instructor.name",
      "instructor.role",
      "instructor.bio",
      "instructor.avatar",
    ],
  },
  {
    id: "details",
    title: "Course details",
    fieldKeys: [
      "details.skillLevel",
      "details.language",
      "details.durationHours",
      "details.lessonCount",
      "details.certificate",
      "details.access",
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    fieldKeys: ["price", "originalPrice", "isFree", "isFeatured"],
  },
  {
    id: "stats",
    title: "Course stats",
    fieldKeys: [
      "durationHours",
      "lessonCount",
      "rating",
      "reviewCount",
      "studentCount",
      "sortOrder",
    ],
  },
  {
    id: "badges",
    title: "Badges & buttons",
    fieldKeys: [
      "badges.premium.text",
      "badges.premium.isVisible",
      "badges.free.text",
      "badges.free.isVisible",
      "ctaButton.label",
      "ctaButton.url",
      "ctaButton.style",
      "ctaButton.isVisible",
      "wishlistButton.isVisible",
    ],
  },
  {
    id: "settings",
    title: "Publish settings",
    fieldKeys: ["isPublished", "isVisible", "status"],
  },
];

const fieldMap = new Map(COURSE_FORM_FIELDS.map((f) => [f.key, f]));

export function getCoursePanelFields(panel: CourseFormPanel): FormField[] {
  return panel.fieldKeys
    .map((key) => fieldMap.get(key))
    .filter((f): f is FormField => Boolean(f));
}
