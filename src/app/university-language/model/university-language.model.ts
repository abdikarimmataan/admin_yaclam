import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type UniversityLanguageRecord = {
  id?: string;
  name?: string;
  countryId?: string | { id?: string; name?: string };
  created_by?: string;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const UNIVERSITY_LANGUAGE_API_PATH = "/university_languages";

export const UNIVERSITY_LANGUAGE_FORM_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "e.g. English",
    hint: "Language of instruction (e.g. English, Arabic). Assign languages when editing a university so they appear on the website.",
  },
  {
    key: "countryId",
    label: "Country",
    type: "select",
    required: true,
    hint: "Country this language is commonly taught in. Used for admin reference and filtering.",
  },
];

export const UNIVERSITY_LANGUAGE_CREATE_KEYS = ["name", "countryId"] as const;

export function resolveRefId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "id" in value) {
    return String((value as { id?: string }).id ?? "");
  }
  return "";
}

export function getUniversityLanguageLabel(item: UniversityLanguageRecord): string {
  return String(item.name ?? item.id ?? "—");
}

function recordTimestamp(item: UniversityLanguageRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortUniversityLanguagesByLatestSaved(
  items: UniversityLanguageRecord[]
): UniversityLanguageRecord[] {
  return [...items].sort((a, b) => recordTimestamp(b) - recordTimestamp(a));
}

export function countryLabelFromLanguage(
  item: UniversityLanguageRecord,
  countryNameById?: Map<string, string>
): string {
  const country = item.countryId;
  if (!country) return "—";
  if (typeof country === "string") {
    return countryNameById?.get(country) ?? "—";
  }
  return String(country.name ?? "—");
}
