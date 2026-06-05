import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type FieldRef = {
  id?: string;
  name?: string;
  icon?: string;
};

export type CourseLesson = {
  id?: string;
  title?: string;
  duration?: string;
  free?: boolean;
  videoUrl?: string;
  vimeoId?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

export type CourseModule = {
  title?: string;
  sortOrder?: number;
  isVisible?: boolean;
  lessons?: CourseLesson[];
};

export type CourseRecord = {
  id?: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  fieldId?: string | FieldRef | null;
  level?: string;
  language?: string;
  duration?: string;
  color?: string;
  badge?: string;
  certificate?: boolean;
  access?: string;
  instructorId?: string | null;
  instructorName?: string;
  thumbnail?: string;
  price?: number;
  originalPrice?: number;
  isFree?: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
  durationHours?: number;
  lessonCount?: number;
  rating?: number;
  reviewCount?: number;
  studentCount?: number;
  status?: boolean;
  overview?: {
    headline?: string;
    description?: string;
    outcomes?: string[];
  };
  details?: {
    skillLevel?: string;
    language?: string;
    durationHours?: number;
    lessonCount?: number;
    certificate?: boolean;
    access?: string;
  };
  instructor?: {
    instructorId?: string | null;
    name?: string;
    role?: string;
    bio?: string;
    avatar?: string;
  };
  curriculum?: CourseModule[];
  created_at?: string;
};

export const COURSE_API_PATH = "/course";

export const COURSE_FORM_FIELDS: FormField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "fieldId", label: "Field", type: "text", required: true },
  { key: "shortDescription", label: "Short Description", type: "textarea" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "category", label: "Category", type: "text" },
  { key: "level", label: "Level", type: "text" },
  { key: "language", label: "Language", type: "text" },
  { key: "duration", label: "Duration", type: "text" },
  { key: "color", label: "Color", type: "text" },
  { key: "badge", label: "Badge", type: "text" },
  { key: "certificate", label: "Certificate", type: "boolean" },
  { key: "access", label: "Access", type: "text" },
  { key: "instructorName", label: "Instructor Name", type: "text" },
  { key: "instructor.instructorId", label: "Instructor ID", type: "text" },
  { key: "instructor.name", label: "Instructor (nested)", type: "text" },
  { key: "instructor.role", label: "Instructor Role", type: "text" },
  { key: "instructor.bio", label: "Instructor Bio", type: "textarea" },
  { key: "instructor.avatar", label: "Instructor Avatar URL", type: "text" },
  { key: "overview.headline", label: "Overview Headline", type: "text" },
  { key: "overview.description", label: "Overview Description", type: "textarea" },
  {
    key: "overview.outcomes",
    label: "Learning Outcomes (comma separated)",
    type: "stringList",
  },
  { key: "details.skillLevel", label: "Skill Level", type: "text" },
  { key: "details.language", label: "Details Language", type: "text" },
  { key: "details.durationHours", label: "Details Duration Hours", type: "number" },
  { key: "details.lessonCount", label: "Details Lesson Count", type: "number" },
  { key: "details.certificate", label: "Details Certificate", type: "boolean" },
  { key: "details.access", label: "Details Access", type: "text" },
  { key: "price", label: "Price", type: "number" },
  { key: "originalPrice", label: "Original Price", type: "number" },
  { key: "isFree", label: "Free", type: "boolean" },
  { key: "isFeatured", label: "Featured", type: "boolean" },
  { key: "isPublished", label: "Published", type: "boolean" },
  { key: "isVisible", label: "Visible", type: "boolean" },
  { key: "status", label: "Status", type: "boolean" },
  { key: "durationHours", label: "Duration Hours", type: "number" },
  { key: "lessonCount", label: "Lesson Count", type: "number" },
  { key: "rating", label: "Rating", type: "number" },
  { key: "reviewCount", label: "Review Count", type: "number" },
  { key: "studentCount", label: "Student Count", type: "number" },
  { key: "sortOrder", label: "Sort Order", type: "number" },
  { key: "badges.premium.text", label: "Premium Badge Text", type: "text" },
  { key: "badges.premium.isVisible", label: "Premium Badge Visible", type: "boolean" },
  { key: "badges.free.text", label: "Free Badge Text", type: "text" },
  { key: "badges.free.isVisible", label: "Free Badge Visible", type: "boolean" },
  { key: "ctaButton.label", label: "CTA Button Label", type: "text" },
  { key: "ctaButton.url", label: "CTA Button URL", type: "text" },
  { key: "ctaButton.style", label: "CTA Button Style", type: "text" },
  { key: "ctaButton.isVisible", label: "CTA Button Visible", type: "boolean" },
  { key: "wishlistButton.isVisible", label: "Wishlist Visible", type: "boolean" },
];

export function resolveUploadUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getCourseLabel(item: CourseRecord): string {
  return String(item.title ?? item.id ?? "—");
}

export function getCourseFieldId(item: CourseRecord): string {
  const f = item.fieldId;
  if (!f) return "";
  if (typeof f === "string") return f;
  return String(f.id ?? "");
}

export function getCourseFieldName(item: CourseRecord): string {
  const f = item.fieldId;
  if (f && typeof f === "object" && "name" in f) {
    return String(f.name ?? "—");
  }
  return "—";
}

export function emptyCurriculumModule(index = 0): CourseModule {
  return {
    title: "",
    sortOrder: index,
    isVisible: true,
    lessons: [],
  };
}

export function emptyCurriculumLesson(
  moduleIndex: number,
  lessonIndex: number,
  courseId = "course"
) {
  const prefix = String(courseId).trim() || "course";
  return {
    id: `${prefix}-m${moduleIndex + 1}-l${lessonIndex + 1}`,
    title: "",
    duration: "",
    free: false,
    videoUrl: "",
    vimeoId: "",
    sortOrder: lessonIndex,
    isVisible: true,
  };
}
