import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type BlogCategoryRef = {
  id?: string;
  name?: string;
  description?: string;
  color?: string;
};

export type BlogPostRecord = {
  id?: string;
  title?: string;
  excerpt?: string;
  body?: string[];
  content?: string;
  categoryId?: string | BlogCategoryRef | null;
  category?: string;
  color?: string;
  readTime?: number;
  publishedDate?: string;
  date?: string;
  coverImage?: string;
  authorName?: string;
  author?: string;
  tags?: string[];
  status?: "draft" | "published";
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const BLOG_POST_API_PATH = "/blog_posts";

export const BLOG_POST_STATUSES = ["draft", "published"] as const;

export const BLOG_FORM_FIELDS: FormField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "categoryId", label: "Category", type: "text", required: true },
  { key: "excerpt", label: "Excerpt", type: "textarea" },
  { key: "readTime", label: "Read Time (min)", type: "number" },
  { key: "publishedDate", label: "Published Date", type: "text" },
  { key: "tags", label: "Tags", type: "text" },
  { key: "content", label: "Content", type: "textarea", required: true },
];

export const BLOG_FULL_WIDTH_KEYS = new Set(["categoryId", "excerpt", "content"]);

export const BLOG_CREATE_KEYS = [
  "title",
  "categoryId",
  "excerpt",
  "readTime",
  "publishedDate",
  "tags",
  "content",
] as const;

export function getBlogPostLabel(item: BlogPostRecord): string {
  return String(item.title ?? item.id ?? "—");
}

export function getBlogPostCategoryId(item: BlogPostRecord): string {
  const c = item.categoryId;
  if (!c) return "";
  if (typeof c === "string") return c;
  return String(c.id ?? "");
}

export function getBlogPostCategoryName(item: BlogPostRecord): string {
  const c = item.categoryId;
  if (c && typeof c === "object" && "name" in c) {
    return String(c.name ?? "—");
  }
  return String(item.category ?? "—");
}

function recordTimestamp(item: BlogPostRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortBlogPostsByLatestSaved(items: BlogPostRecord[]): BlogPostRecord[] {
  return [...items].sort((a, b) => recordTimestamp(b) - recordTimestamp(a));
}
