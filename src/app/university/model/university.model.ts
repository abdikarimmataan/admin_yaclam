import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { resolveRefId } from "@/app/university-language/model/university-language.model";
import type { UniversityLocationRecord } from "@/app/university-location/model/university-location.model";
import { countryIdFromLocationRef } from "@/app/university/lib/university-location-helpers";

export type UniversityRef = { id?: string; name?: string };
export type UniversityLocationRef = UniversityRef & {
  countryId?: UniversityRef;
};
export type UniversityLanguageRef = UniversityRef & {
  countryId?: UniversityRef;
};
export type UniversityCategoryRef = UniversityRef;

export type UniversityProgram = {
  course?: string;
  field?: string;
  level?: string;
  duration?: string;
  language?: string;
  tuition?: string;
  link?: string;
};

export type UniversityOffering = {
  studyAreaId?: string | UniversityRef;
  disciplineId?: string | UniversityRef;
  categoryId?: string | UniversityCategoryRef;
  year?: string;
  languageIds?: Array<string | UniversityLanguageRef>;
  feePerYear?: string;
  website?: string;
};

export type UniversityRecord = {
  id?: string;
  name?: string;
  locationId?: string | UniversityLocationRef;
  categoryId?: string | UniversityCategoryRef;
  year?: string | null;
  programs?: UniversityProgram[];
  offerings?: UniversityOffering[];
  languageIds?: Array<string | UniversityLanguageRef>;
  feePerYear?: string;
  website?: string;
  sortOrder?: number;
  isPublished?: boolean;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const UNIVERSITY_API_PATH = "/universities";

export const UNIVERSITY_BASIC_FORM_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "e.g. University of Oxford",
    hint: "Official university name shown on the website.",
  },
  {
    key: "countryId",
    label: "Country",
    type: "select",
    required: true,
    hint: "Select the country first, then pick a city/location below.",
  },
  {
    key: "locationId",
    label: "Location",
    type: "select",
    required: true,
    hint: "Cities for the selected country. Shown as City, Country on the website.",
  },
];

export const UNIVERSITY_MANAGE_FORM_FIELDS: FormField[] = [
  {
    key: "categoryId",
    label: "Degree Level",
    type: "select",
    required: true,
    hint: "Degree level tab on /universities (e.g. Bachelor, Master). Must match a visible Degree Level.",
  },
  {
    key: "year",
    label: "Year",
    type: "text",
    placeholder: "e.g. 4 years",
    hint: "Program duration (not a calendar year). Examples: 4 years, 2 years.",
  },
  {
    key: "languageIds",
    label: "Languages",
    type: "select",
    hint: "Languages of instruction. Synced to program cards on save.",
  },
  {
    key: "feePerYear",
    label: "Fee / yr",
    type: "text",
    placeholder: "e.g. £9,250/yr",
    hint: "Yearly tuition text on cards.",
  },
  {
    key: "website",
    label: "Website link",
    type: "text",
    placeholder: "https://www.ox.ac.uk/",
    hint: "Full URL with https:// for the Visit button on the website.",
  },
];

export const UNIVERSITY_FORM_FIELDS: FormField[] = [
  ...UNIVERSITY_BASIC_FORM_FIELDS,
  ...UNIVERSITY_MANAGE_FORM_FIELDS,
  {
    key: "sortOrder",
    label: "Sort Order",
    type: "number",
    hint: "Lower numbers list first in admin. Does not change website tab order.",
  },
];

export const UNIVERSITY_CREATE_KEYS = ["name", "countryId", "locationId"] as const;

export const UNIVERSITY_MANAGE_KEYS = ["offerings"] as const;

export type ManageOfferingForm = {
  studyAreaId: string;
  disciplineId: string;
  categoryId: string;
  year: string;
  languageIds: string[];
  feePerYear: string;
  website: string;
};

export function emptyManageOffering(): ManageOfferingForm {
  return {
    studyAreaId: "",
    disciplineId: "",
    categoryId: "",
    year: "",
    languageIds: [],
    feePerYear: "",
    website: "",
  };
}

type LookupOption = { id: string; text: string };

function matchLookupId(options: LookupOption[], label: string): string {
  const trimmed = String(label ?? "").trim();
  if (!trimmed) return "";
  const match = options.find((option) => option.text === trimmed);
  return match?.id ?? "";
}

function offeringRecordToForm(row: Record<string, unknown>): ManageOfferingForm {
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

function programRowToOfferingForm(
  program: UniversityProgram,
  categoryOptions: LookupOption[],
  studyAreaOptions: LookupOption[],
  disciplineOptions: LookupOption[],
  record: Record<string, unknown>
): ManageOfferingForm {
  const level = String(program.level ?? "").trim();
  const course = String(program.course ?? "").trim();
  const field = String(program.field ?? "").trim();

  let categoryId = matchLookupId(categoryOptions, level);
  if (!categoryId) categoryId = resolveRefId(record.categoryId);

  return {
    studyAreaId: matchLookupId(studyAreaOptions, course),
    disciplineId: matchLookupId(disciplineOptions, field),
    categoryId,
    year: String(program.duration ?? record.year ?? ""),
    languageIds: [],
    feePerYear: String(program.tuition ?? record.feePerYear ?? ""),
    website: String(program.link ?? record.website ?? ""),
  };
}

function legacyRecordToOfferingForm(
  record: Record<string, unknown>,
  categoryOptions: LookupOption[]
): ManageOfferingForm {
  let categoryId = resolveRefId(record.categoryId);
  if (!categoryId && categoryOptions.length) {
    const level = Array.isArray(record.programs)
      ? String((record.programs[0] as UniversityProgram | undefined)?.level ?? "").trim()
      : "";
    if (level) categoryId = matchLookupId(categoryOptions, level);
  }

  const languageIds = Array.isArray(record.languageIds)
    ? record.languageIds
        .map((lang) =>
          typeof lang === "object" && lang ? resolveRefId(lang) : String(lang ?? "")
        )
        .filter(Boolean)
    : [];

  return {
    studyAreaId: "",
    disciplineId: "",
    categoryId,
    year: String(record.year ?? ""),
    languageIds,
    feePerYear: String(record.feePerYear ?? ""),
    website: String(record.website ?? ""),
  };
}

function pickProgramDuration(programs?: UniversityProgram[]): string {
  if (!Array.isArray(programs) || programs.length === 0) return "";
  const bachelor = programs.find((p) => p.level === "Bachelor" && p.duration?.trim());
  if (bachelor?.duration) return bachelor.duration.trim();
  const first = programs.find((p) => p.duration?.trim());
  return first?.duration?.trim() || "";
}

export function universityYearLabel(item: UniversityRecord): string {
  const raw = item.year != null ? String(item.year).trim() : "";
  if (raw && (/\d+\s*year/i.test(raw) || /month/i.test(raw))) return raw;
  const fromPrograms = pickProgramDuration(item.programs);
  if (fromPrograms) return fromPrograms;
  return raw || "—";
}

export function getUniversityLabel(item: UniversityRecord): string {
  return String(item.name ?? item.id ?? "—");
}

export function offeringsCountFromUniversity(item: UniversityRecord): number {
  if (Array.isArray(item.offerings) && item.offerings.length > 0) {
    return item.offerings.length;
  }
  if (Array.isArray(item.programs) && item.programs.length > 0) {
    return item.programs.length;
  }
  return 0;
}

export function studyAreasSummaryFromUniversity(item: UniversityRecord): string {
  const names: string[] = [];

  if (Array.isArray(item.offerings) && item.offerings.length > 0) {
    item.offerings.forEach((row) => {
      const studyArea = row.studyAreaId;
      if (studyArea && typeof studyArea === "object" && studyArea.name) {
        names.push(String(studyArea.name));
      }
    });
  } else if (Array.isArray(item.programs)) {
    item.programs.forEach((program) => {
      if (program.course?.trim()) names.push(program.course.trim());
    });
  }

  const unique = [...new Set(names)];
  if (!unique.length) return "—";
  if (unique.length <= 2) return unique.join(", ");
  return `${unique.slice(0, 2).join(", ")} +${unique.length - 2}`;
}

export function degreeLevelLabelFromUniversity(item: UniversityRecord): string {
  const category = item.categoryId;
  if (category && typeof category === "object") {
    return String(category.name ?? "—");
  }
  const level = item.programs?.[0]?.level;
  return level ? String(level) : "—";
}

/** @deprecated use degreeLevelLabelFromUniversity */
export const categoryLabelFromUniversity = degreeLevelLabelFromUniversity;
export const programLabelFromUniversity = degreeLevelLabelFromUniversity;

export function countryLabelFromUniversity(item: UniversityRecord): string {
  const location = item.locationId;
  if (!location || typeof location === "string") return "—";
  const country = location.countryId;
  if (country && typeof country === "object") return String(country.name ?? "—");
  return "—";
}

export function locationLabelFromUniversity(item: UniversityRecord): string {
  const location = item.locationId;
  if (!location || typeof location === "string") return "—";
  const city = location.name ?? "—";
  const country =
    location.countryId && typeof location.countryId === "object"
      ? location.countryId.name
      : undefined;
  return country ? `${city}, ${country}` : city;
}

export function languageLabelsFromUniversity(item: UniversityRecord): string {
  const langs = item.languageIds;
  if (!Array.isArray(langs) || langs.length === 0) return "—";
  return langs
    .map((lang) => (typeof lang === "object" ? lang.name : lang))
    .filter(Boolean)
    .join(", ");
}

function recordTimestamp(item: UniversityRecord): number {
  const raw = item.updated_at ?? item.created_at;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortUniversitiesByLatestSaved(items: UniversityRecord[]): UniversityRecord[] {
  return [...items].sort((a, b) => {
    const byTime = recordTimestamp(b) - recordTimestamp(a);
    if (byTime !== 0) return byTime;
    return Number(b.sortOrder ?? 0) - Number(a.sortOrder ?? 0);
  });
}

export function getNextUniversitySortOrderSuggestion(items: UniversityRecord[]): number {
  if (!items.length) return 1;
  const max = Math.max(0, ...items.map((item) => Number(item.sortOrder) || 0));
  return max + 1;
}

export function toUniversityBasicFormValues(
  record: Record<string, unknown>,
  locationRecords: UniversityLocationRecord[] = []
): Record<string, unknown> {
  const locationId = resolveRefId(record.locationId);
  const countryId = countryIdFromLocationRef(
    locationId,
    locationRecords,
    record.locationId
  );

  return {
    name: record.name ?? "",
    countryId,
    locationId,
  };
}

export function toManageUniversityFormValues(
  record: Record<string, unknown>,
  categoryOptions: LookupOption[] = [],
  studyAreaOptions: LookupOption[] = [],
  disciplineOptions: LookupOption[] = []
): Record<string, unknown> {
  const offeringsRaw = Array.isArray(record.offerings) ? record.offerings : [];

  if (offeringsRaw.length > 0) {
    return {
      universityId: resolveRefId(record.id),
      offerings: offeringsRaw.map((row) =>
        offeringRecordToForm(row as Record<string, unknown>)
      ),
    };
  }

  const programs = Array.isArray(record.programs)
    ? (record.programs as UniversityProgram[])
    : [];
  if (programs.length > 0) {
    return {
      universityId: resolveRefId(record.id),
      offerings: programs.map((program) =>
        programRowToOfferingForm(
          program,
          categoryOptions,
          studyAreaOptions,
          disciplineOptions,
          record
        )
      ),
    };
  }

  return {
    universityId: resolveRefId(record.id),
    offerings: [legacyRecordToOfferingForm(record, categoryOptions)],
  };
}

export function toUniversityFormValues(
  record: Record<string, unknown>,
  categoryOptions: Array<{ id: string; text: string }> = [],
  locationRecords: UniversityLocationRecord[] = []
): Record<string, unknown> {
  const languageIds = Array.isArray(record.languageIds)
    ? record.languageIds.map((lang) =>
        typeof lang === "object" && lang ? resolveRefId(lang) : String(lang ?? "")
      ).filter(Boolean)
    : [];

  let categoryId = resolveRefId(record.categoryId);
  if (!categoryId && categoryOptions.length) {
    const level = Array.isArray(record.programs)
      ? String((record.programs[0] as UniversityProgram | undefined)?.level ?? "").trim()
      : "";
    if (level) {
      const match = categoryOptions.find((option) => option.text === level);
      categoryId = match?.id ?? "";
    }
  }

  const locationId = resolveRefId(record.locationId);
  const countryId = countryIdFromLocationRef(
    locationId,
    locationRecords,
    record.locationId
  );

  return {
    ...record,
    countryId,
    locationId,
    categoryId,
    languageIds,
    year: record.year ?? "",
    feePerYear: record.feePerYear ?? "",
    website: record.website ?? "",
    sortOrder: record.sortOrder ?? "",
  };
}
