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
  timeToJobReady?: string;
  timeToJobReadyDisplay?: string;
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

export const DUPLICATE_SORT_ORDER_TOOLTIP =
  "Duplicate sort order. This roadmap will not appear on the homepage.";

export function getDuplicateSortOrders(items: RoadmapRecord[]): Set<number> {
  const counts = new Map<number, number>();

  for (const item of items) {
    if (item.sortOrder == null || !Number.isFinite(Number(item.sortOrder))) continue;
    const order = Number(item.sortOrder);
    counts.set(order, (counts.get(order) ?? 0) + 1);
  }

  const duplicates = new Set<number>();
  counts.forEach((count, order) => {
    if (count > 1) duplicates.add(order);
  });

  return duplicates;
}

export const ROADMAP_FORM_FIELDS: FormField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "icon", label: "Icon", type: "text", required: true },
  { key: "demand", label: "Market Demand", type: "text", required: true },
  { key: "salary", label: "Salary Range", type: "text", required: true },
  { key: "timeToJobReady", label: "Time to Job Ready", type: "text", required: true },
  { key: "sortOrder", label: "Sort Order", type: "text", required: true },
  { key: "ctaButton.label", label: "CTA Button Label", type: "text", required: true },
  { key: "ctaButton.url", label: "CTA Button URL", type: "text", required: true },
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
  "timeToJobReady",
  "skills",
  "steps",
  "sortOrder",
  "ctaButton.label",
  "ctaButton.url",
] as const;

export function getRoadmapLabel(item: RoadmapRecord): string {
  return String(item.title ?? item.id ?? "—");
}

export function getNextRoadmapSortOrderSuggestion(items: RoadmapRecord[]): string {
  if (items.length === 0) return "1";

  const max = items.reduce((acc, item) => {
    const n = Number(item.sortOrder);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);

  return String(max + 1);
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
