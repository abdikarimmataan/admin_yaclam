import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type FieldRef = {
  id?: string;
  name?: string;
  icon?: string;
};

export type CourseCategoryRef = {
  id?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
};

export type CourseLesson = {
  id?: string;
  title?: string;
  duration?: string;
  free?: boolean;
  lessonType?: "video" | "link";
  videoUrl?: string;
  linkUrl?: string;
  vimeoId?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

/** UI row — may hold a local video file before save uploads it via multipart. */
export type CourseLessonFormRow = CourseLesson & {
  pendingVideoFile?: File | null;
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
  courseCategoryId?: string | CourseCategoryRef | null;
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
  previewVideoUrl?: string;
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
    decimals: 2,
    placeholder: "e.g. 0.10",
  },
  {
    key: "originalPrice",
    label: "Original Price",
    type: "number",
    decimals: 2,
    placeholder: "e.g. 99.00",
  },
  { key: "isFree", label: "Free", type: "boolean" },
  { key: "isFeatured", label: "Featured", type: "boolean" },
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

export function getCourseCategoryId(item: CourseRecord): string {
  const c = item.courseCategoryId;
  if (!c) return "";
  if (typeof c === "string") return c;
  return String(c.id ?? "");
}

export function getCourseCategoryName(item: CourseRecord): string {
  const c = item.courseCategoryId;
  if (c && typeof c === "object" && "name" in c) {
    return String(c.name ?? "—");
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
): CourseLessonFormRow {
  const prefix = String(courseId).trim() || "course";
  return {
    id: `${prefix}-m${moduleIndex + 1}-l${lessonIndex + 1}`,
    title: "",
    duration: "",
    free: false,
    lessonType: "video" as const,
    videoUrl: "",
    linkUrl: "",
    vimeoId: "",
    sortOrder: lessonIndex,
    isVisible: true,
    pendingVideoFile: null,
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
