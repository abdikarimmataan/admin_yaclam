import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export const SCHOLARSHIP_FUNDING_TYPES = ["Full", "Partial"] as const;

export const SCHOLARSHIP_LIST_KEYS = ["benefits", "eligibility", "documents"] as const;

export type ScholarshipRecord = {
  id?: string;
  name?: string;
  title?: string;
  provider?: string;
  country?: string;
  level?: string;
  funding?: string;
  flag?: string;
  amount?: string;
  deadline?: string;
  website?: string;
  overview?: string;
  description?: string;
  benefits?: string[];
  eligibility?: string[];
  documents?: string[];
  applicationUrl?: string;
  sortOrder?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  isVisible?: boolean;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
  ctaButton?: {
    label?: string;
    url?: string;
    isVisible?: boolean;
  };
};

export const SCHOLARSHIP_API_PATH = "/scholarship";

export const SCHOLARSHIP_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "provider", label: "Provider", type: "text" },
  { key: "country", label: "Country", type: "text" },
  { key: "level", label: "Level", type: "text" },
  { key: "funding", label: "Funding", type: "text" },
  { key: "flag", label: "Flag", type: "text" },
  { key: "amount", label: "Amount", type: "text" },
  { key: "deadline", label: "Deadline", type: "text" },
  { key: "sortOrder", label: "Sort Order", type: "number" },
  { key: "website", label: "Website", type: "text" },
  { key: "applicationUrl", label: "Application URL", type: "text" },
  { key: "ctaButton.label", label: "CTA Button Label", type: "text" },
  { key: "ctaButton.url", label: "CTA Button URL", type: "text" },
  { key: "overview", label: "Overview", type: "textarea" },
  { key: "benefits", label: "Benefits", type: "text" },
  { key: "eligibility", label: "Eligibility", type: "text" },
  { key: "documents", label: "Documents Required", type: "text" },
];

export const SCHOLARSHIP_FULL_WIDTH_KEYS = new Set([
  "overview",
  "benefits",
  "eligibility",
  "documents",
]);

export const SCHOLARSHIP_CREATE_KEYS = [
  "name",
  "slug",
  "provider",
  "country",
  "level",
  "funding",
  "flag",
  "amount",
  "deadline",
  "website",
  "overview",
  "benefits",
  "eligibility",
  "documents",
  "sortOrder",
] as const;

export function getScholarshipLabel(item: ScholarshipRecord): string {
  return String(item.name ?? item.title ?? item.id ?? "—");
}

export function getNextSortOrder(items: ScholarshipRecord[]): number {
  if (!items.length) return 1;
  const max = Math.max(0, ...items.map((item) => Number(item.sortOrder) || 0));
  return max + 1;
}

function recordTimestamp(item: ScholarshipRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortScholarshipsByLatestSaved(items: ScholarshipRecord[]): ScholarshipRecord[] {
  return [...items].sort((a, b) => {
    const byTime = recordTimestamp(b) - recordTimestamp(a);
    if (byTime !== 0) return byTime;
    return Number(b.sortOrder ?? 0) - Number(a.sortOrder ?? 0);
  });
}
