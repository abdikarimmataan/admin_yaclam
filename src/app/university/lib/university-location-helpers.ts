import { resolveRefId } from "@/app/university-language/model/university-language.model";
import type { UniversityLocationRecord } from "@/app/university-location/model/university-location.model";
import type { Select2Option } from "@/shared/components/Select2";

export const UNIVERSITY_FILTER_ALL = "";

export function locationCountryId(location: UniversityLocationRecord): string {
  return resolveRefId(location.countryId);
}

export function locationsForCountry(
  locations: UniversityLocationRecord[],
  countryId: string
): UniversityLocationRecord[] {
  const id = String(countryId ?? "").trim();
  if (!id) return [];
  return locations.filter((row) => locationCountryId(row) === id);
}

export function locationsToSelectOptions(
  locations: UniversityLocationRecord[]
): Select2Option[] {
  return locations
    .filter((row) => row.id)
    .map((row) => ({
      id: String(row.id),
      text: String(row.name ?? row.id),
    }));
}

export function countryIdFromLocationRef(
  locationId: string,
  locations: UniversityLocationRecord[],
  locationRef?: unknown
): string {
  if (locationRef && typeof locationRef === "object") {
    const fromRef = resolveRefId((locationRef as { countryId?: unknown }).countryId);
    if (fromRef) return fromRef;
  }
  if (!locationId) return "";
  const match = locations.find((row) => String(row.id) === locationId);
  return match ? locationCountryId(match) : "";
}

export function withAllOption(options: Select2Option[], label = "All"): Select2Option[] {
  return [{ id: UNIVERSITY_FILTER_ALL, text: label }, ...options];
}
