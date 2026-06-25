import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { resolveRefId } from "@/app/university-language/model/university-language.model";

export type UniversityLocationRecord = {
  id?: string;
  name?: string;
  countryId?: string | { id?: string; name?: string };
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const UNIVERSITY_LOCATION_API_PATH = "/university_locations";

export const UNIVERSITY_LOCATION_FORM_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "e.g. Mogadishu",
    hint: "City or campus name. Assign this location when editing a university — it becomes the city/country shown on the website.",
  },
  {
    key: "countryId",
    label: "Country",
    type: "select",
    required: true,
    hint: "Country where this city is located.",
  },
];

export const UNIVERSITY_LOCATION_CREATE_KEYS = ["name", "countryId"] as const;

export { resolveRefId };

export function getUniversityLocationLabel(item: UniversityLocationRecord): string {
  return String(item.name ?? item.id ?? "—");
}

function recordTimestamp(item: UniversityLocationRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortUniversityLocationsByLatestSaved(
  items: UniversityLocationRecord[]
): UniversityLocationRecord[] {
  return [...items].sort((a, b) => recordTimestamp(b) - recordTimestamp(a));
}

export function countryLabelFromLocation(
  item: UniversityLocationRecord,
  countryNameById?: Map<string, string>
): string {
  const country = item.countryId;
  if (!country) return "—";
  if (typeof country === "string") {
    return countryNameById?.get(country) ?? "—";
  }
  return String(country.name ?? "—");
}
