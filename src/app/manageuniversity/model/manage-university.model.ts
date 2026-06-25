import { resolveRefId } from "@/app/university-language/model/university-language.model";
import type { UniversityLocationRef, UniversityRecord } from "@/app/university/model/university.model";
import {
  emptyManageOffering,
  type ManageOfferingForm,
} from "@/app/university/model/university.model";

export type ManageUniversityOffering = {
  studyAreaId?: string | { id?: string; name?: string };
  disciplineId?: string | { id?: string; name?: string };
  categoryId?: string | { id?: string; name?: string };
  year?: string;
  languageIds?: Array<string | { id?: string; name?: string }>;
  feePerYear?: string;
  website?: string;
};

export type ManageUniversityRecord = {
  id?: string;
  universityId?: string | UniversityRecord;
  offerings?: ManageUniversityOffering[];
  created_at?: string;
  updated_at?: string;
};

export const MANAGE_UNIVERSITY_API_PATH = "/university_manages";

function offeringToForm(row: ManageUniversityOffering): ManageOfferingForm {
  const languageIds = Array.isArray(row.languageIds)
    ? row.languageIds
        .map((lang) =>
          typeof lang === "object" && lang ? resolveRefId(lang) : String(lang ?? "")
        )
        .filter(Boolean)
    : [];

  return {
    studyAreaId: resolveRefId(row.studyAreaId),
    disciplineId: resolveRefId(row.disciplineId),
    categoryId: resolveRefId(row.categoryId),
    year: String(row.year ?? ""),
    languageIds,
    feePerYear: String(row.feePerYear ?? ""),
    website: String(row.website ?? ""),
  };
}

export function universityFromManageRecord(item: ManageUniversityRecord): UniversityRecord | null {
  const university = item.universityId;
  if (!university || typeof university === "string") return null;
  return university;
}

export function getManageUniversityLabel(item: ManageUniversityRecord): string {
  const university = universityFromManageRecord(item);
  return String(university?.name ?? item.id ?? "—");
}

export function locationLabelFromManageRecord(item: ManageUniversityRecord): string {
  const university = universityFromManageRecord(item);
  if (!university) return "—";
  const location = university.locationId;
  if (!location || typeof location === "string") return "—";
  const city = location.name ?? "—";
  const country =
    location.countryId && typeof location.countryId === "object"
      ? location.countryId.name
      : undefined;
  return country ? `${city}, ${country}` : city;
}

export function offeringsCountFromManageRecord(item: ManageUniversityRecord): number {
  return Array.isArray(item.offerings) ? item.offerings.length : 0;
}

export function studyAreasSummaryFromManageRecord(item: ManageUniversityRecord): string {
  const names: string[] = [];
  if (!Array.isArray(item.offerings)) return "—";

  item.offerings.forEach((row) => {
    const studyArea = row.studyAreaId;
    if (studyArea && typeof studyArea === "object" && studyArea.name) {
      names.push(String(studyArea.name));
    }
  });

  const unique = [...new Set(names)];
  if (!unique.length) return "—";
  if (unique.length <= 2) return unique.join(", ");
  return `${unique.slice(0, 2).join(", ")} +${unique.length - 2}`;
}

function recordTimestamp(item: ManageUniversityRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortManageUniversitiesByLatestSaved(
  items: ManageUniversityRecord[]
): ManageUniversityRecord[] {
  return [...items].sort((a, b) => recordTimestamp(b) - recordTimestamp(a));
}

export function toManageUniversityFormValues(
  record: ManageUniversityRecord
): Record<string, unknown> {
  const university = universityFromManageRecord(record);
  const offerings = Array.isArray(record.offerings) ? record.offerings : [];

  return {
    manageId: resolveRefId(record.id),
    universityId: university ? resolveRefId(university.id) : resolveRefId(record.universityId),
    offerings:
      offerings.length > 0
        ? offerings.map(offeringToForm)
        : [emptyManageOffering()],
  };
}
