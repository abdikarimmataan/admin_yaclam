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

export type CourseResource = {
  id?: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

/** UI row — may hold a local file before save uploads it via multipart. */
export type CourseResourceFormRow = CourseResource & {
  pendingFile?: File | null;
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
  resources?: CourseResource[];
  created_at?: string;
};

export const COURSE_API_PATH = "/course";

const COURSE_LEVEL_OPTIONS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const COURSE_LANGUAGE_OPTIONS = [
  { value: "Somali", label: "Somali" },
  { value: "English", label: "English" },
  { value: "Arabic", label: "Arabic" },
];

const COURSE_ACCESS_OPTIONS = [
  { value: "1 Year", label: "1 Year" },
  { value: "Lifetime", label: "Lifetime" },
  { value: "6 Months", label: "6 Months" },
];

const COURSE_BUTTON_STYLE_OPTIONS = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
];

export const COURSE_FORM_FIELDS: FormField[] = [
  {
    key: "title",
    label: "Title",
    type: "text",
    required: true,
    placeholder: "e.g. Introduction to Web Development",
  },
  { key: "fieldId", label: "Field", type: "text", required: true },
  {
    key: "shortDescription",
    label: "Short Description",
    type: "textarea",
    placeholder: "e.g. Learn HTML, CSS, and JavaScript from scratch in Somali.",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "e.g. A complete beginner-friendly course covering projects, quizzes, and a certificate.",
  },
  {
    key: "level",
    label: "Level",
    type: "select",
    options: COURSE_LEVEL_OPTIONS,
    placeholder: "e.g. Beginner",
  },
  {
    key: "language",
    label: "Language",
    type: "select",
    options: COURSE_LANGUAGE_OPTIONS,
    placeholder: "e.g. Somali",
  },
  {
    key: "duration",
    label: "Duration",
    type: "text",
    placeholder: "e.g. 8 weeks",
  },
  {
    key: "color",
    label: "Color",
    type: "text",
    placeholder: "e.g. #1F3A93",
  },
  {
    key: "badge",
    label: "Badge",
    type: "text",
    placeholder: "e.g. Bestseller",
  },
  { key: "certificate", label: "Certificate", type: "boolean" },
  {
    key: "access",
    label: "Access",
    type: "select",
    options: COURSE_ACCESS_OPTIONS,
    placeholder: "e.g. 1 Year",
  },
  {
    key: "overview.headline",
    label: "Overview Headline",
    type: "text",
    placeholder: "e.g. Build smarter, not harder",
  },
  {
    key: "overview.description",
    label: "Overview Description",
    type: "textarea",
    placeholder: "e.g. Master the fundamentals step by step with hands-on lessons.",
  },
  {
    key: "overview.outcomes",
    label: "Learning Outcomes (comma separated)",
    type: "stringList",
    placeholder: "e.g. Build a portfolio, Deploy a website, Earn a certificate",
  },
  {
    key: "price",
    label: "Price",
    type: "number",
    placeholder: "e.g. 49",
  },
  {
    key: "originalPrice",
    label: "Original Price",
    type: "number",
    placeholder: "e.g. 99",
  },
  { key: "isFree", label: "Free", type: "boolean" },
  { key: "isFeatured", label: "Featured", type: "boolean" },
  { key: "isPublished", label: "Published", type: "boolean" },
  { key: "isVisible", label: "Visible", type: "boolean" },
  { key: "status", label: "Status", type: "boolean" },
  {
    key: "durationHours",
    label: "Duration Hours",
    type: "number",
    placeholder: "e.g. 12",
  },
  {
    key: "lessonCount",
    label: "Lesson Count",
    type: "number",
    placeholder: "e.g. 24",
  },
  {
    key: "rating",
    label: "Rating",
    type: "number",
    placeholder: "e.g. 4.8",
  },
  {
    key: "reviewCount",
    label: "Review Count",
    type: "number",
    placeholder: "e.g. 128",
  },
  {
    key: "studentCount",
    label: "Student Count",
    type: "number",
    placeholder: "e.g. 1500",
  },
  {
    key: "sortOrder",
    label: "Sort Order",
    type: "number",
    placeholder: "e.g. 1",
  },
  {
    key: "badges.premium.text",
    label: "Premium Badge Text",
    type: "text",
    placeholder: "e.g. Premium",
  },
  { key: "badges.premium.isVisible", label: "Premium Badge Visible", type: "boolean" },
  {
    key: "badges.free.text",
    label: "Free Badge Text",
    type: "text",
    placeholder: "e.g. Free",
  },
  { key: "badges.free.isVisible", label: "Free Badge Visible", type: "boolean" },
  {
    key: "ctaButton.label",
    label: "CTA Button Label",
    type: "text",
    placeholder: "e.g. Enroll now",
  },
  {
    key: "ctaButton.url",
    label: "CTA Button URL",
    type: "text",
    placeholder: "e.g. /courses/intro-web-dev",
  },
  {
    key: "ctaButton.style",
    label: "CTA Button Style",
    type: "select",
    options: COURSE_BUTTON_STYLE_OPTIONS,
    placeholder: "e.g. Primary",
  },
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

export function emptyCourseResource(index: number, courseId = "course"): CourseResourceFormRow {
  const prefix = String(courseId).trim() || "course";
  return {
    id: `${prefix}-r${index + 1}`,
    title: "",
    description: "",
    fileUrl: "",
    fileName: "",
    fileSize: 0,
    mimeType: "",
    sortOrder: index,
    isVisible: true,
    pendingFile: null,
  };
}

export const RESOURCE_FILE_ACCEPT =
  ".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf";

export const RESOURCE_MAX_SIZE_MB = 100;
