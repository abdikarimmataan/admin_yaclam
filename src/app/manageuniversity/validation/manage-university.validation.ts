import {
  type ManageOfferingForm,
} from "@/app/university/model/university.model";
import type { ValidationErrorItem } from "@/shared/utils/form-validation";
import { toast } from "@/shared/utils/toast";

const OFFERING_FIELD_LABELS: Record<string, string> = {
  studyAreaId: "Study Area",
  disciplineId: "Discipline",
  categoryId: "Degree Level",
  year: "Year",
  languageIds: "Languages",
  feePerYear: "Fee / yr",
  website: "Website link",
};

export function showManageUniversityValidationToasts(errors: Record<string, string>) {
  const items: ValidationErrorItem[] = [];
  const basicLabels: Record<string, string> = {
    universityId: "University",
    offerings: "Offerings",
  };

  for (const [key, message] of Object.entries(errors)) {
    if (basicLabels[key]) {
      items.push({ key, label: basicLabels[key], message });
      continue;
    }

    const offeringMatch = key.match(/^offerings\.(\d+)\.(\w+)$/);
    if (offeringMatch) {
      const index = Number(offeringMatch[1]) + 1;
      const field = offeringMatch[2];
      items.push({
        key,
        label: `Offering ${index} — ${OFFERING_FIELD_LABELS[field] ?? field}`,
        message,
      });
      continue;
    }

    items.push({ key, label: key, message });
  }

  toast.validationErrors(items);
}

export function validateManageUniversityForm(
  form: Record<string, unknown>,
  editing = false
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!String(form.universityId ?? "").trim()) {
    errors.universityId = "University is required";
  }

  const offerings = Array.isArray(form.offerings) ? form.offerings : [];
  if (!offerings.length) {
    errors.offerings = "Add at least one offering";
  }

  offerings.forEach((row, index) => {
    const offering = row as ManageOfferingForm;
    if (!String(offering.studyAreaId ?? "").trim()) {
      errors[`offerings.${index}.studyAreaId`] = "Study Area is required";
    }
    if (!String(offering.categoryId ?? "").trim()) {
      errors[`offerings.${index}.categoryId`] = "Degree Level is required";
    }
  });

  void editing;
  return errors;
}

export function buildManageUniversityPayload(
  form: Record<string, unknown>
): Record<string, unknown> {
  return {
    universityId: String(form.universityId ?? "").trim(),
    offerings: buildOfferingsPayload(form),
  };
}

function buildOfferingsPayload(form: Record<string, unknown>) {
  const offerings = Array.isArray(form.offerings) ? form.offerings : [];

  return offerings.map((row) => {
    const offering = row as ManageOfferingForm;
    return {
      studyAreaId: String(offering.studyAreaId ?? "").trim(),
      disciplineId: String(offering.disciplineId ?? "").trim() || null,
      categoryId: String(offering.categoryId ?? "").trim(),
      year: String(offering.year ?? "").trim(),
      languageIds: Array.isArray(offering.languageIds)
        ? offering.languageIds.map((value) => String(value)).filter(Boolean)
        : [],
      feePerYear: String(offering.feePerYear ?? "").trim(),
      website: String(offering.website ?? "").trim(),
    };
  });
}
