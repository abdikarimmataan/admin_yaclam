import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export const ROADMAP_DEMAND_LEVELS = ["Very High", "High", "Medium"] as const;

export type RoadmapStep = {
  title?: string;
  detail?: string;
  order?: number;
  isVisible?: boolean;
};

export type RoadmapRecord = {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  skills?: string[];
  demand?: string;
  salary?: string;
  months?: number;
  skillsRequired?: number;
  steps?: RoadmapStep[];
  sortOrder?: number;
  isVisible?: boolean;
  isPublished?: boolean;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
  ctaButton?: {
    label?: string;
    url?: string;
    isVisible?: boolean;
  };
};

export const ROADMAP_API_PATH = "/roadmap";

export const ROADMAP_FORM_FIELDS: FormField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "icon", label: "Icon", type: "text" },
  { key: "demand", label: "Market Demand", type: "text" },
  { key: "salary", label: "Salary Range", type: "text" },
  { key: "months", label: "Time to Job Ready (months)", type: "number" },
  { key: "sortOrder", label: "Sort Order", type: "number" },
  { key: "ctaButton.label", label: "CTA Button Label", type: "text" },
  { key: "ctaButton.url", label: "CTA Button URL", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "skills", label: "Skills", type: "text" },
  { key: "steps", label: "Learning Path", type: "stepsList" },
];

/** Full-width fields in the modal (not placed in the 3-column grid). */
export const ROADMAP_FULL_WIDTH_KEYS = new Set(["description", "skills", "steps"]);

export const ROADMAP_CREATE_KEYS = [
  "title",
  "description",
  "icon",
  "demand",
  "salary",
  "months",
  "skills",
  "steps",
  "sortOrder",
] as const;

export function getRoadmapLabel(item: RoadmapRecord): string {
  return String(item.title ?? item.id ?? "—");
}

export function getNextSortOrder(items: RoadmapRecord[]): number {
  if (!items.length) return 1;
  const max = Math.max(0, ...items.map((item) => Number(item.sortOrder) || 0));
  return max + 1;
}

function recordTimestamp(item: RoadmapRecord): number {
  const raw =
    item.updated_at ??
    (item as RoadmapRecord & { updatedAt?: string }).updatedAt ??
    item.created_at ??
    (item as RoadmapRecord & { createdAt?: string }).createdAt;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

/** Newest created/updated roadmaps first. */
export function sortRoadmapsByLatestSaved(items: RoadmapRecord[]): RoadmapRecord[] {
  return [...items].sort((a, b) => {
    const byTime = recordTimestamp(b) - recordTimestamp(a);
    if (byTime !== 0) return byTime;
    return Number(b.sortOrder ?? 0) - Number(a.sortOrder ?? 0);
  });
}
