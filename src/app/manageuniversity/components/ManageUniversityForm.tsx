"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { FormFieldHint, FormFieldLabel } from "@/shared/components/FormFieldLabel";
import { MultiSelect2 } from "@/shared/components/MultiSelect2";
import { Select2, type Select2Option } from "@/shared/components/Select2";
import {
  emptyManageOffering,
  type ManageOfferingForm,
  UNIVERSITY_MANAGE_FORM_FIELDS,
} from "@/app/university/model/university.model";

type ManageUniversityFormProps = {
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  editing: boolean;
  universityOptions: Select2Option[];
  studyAreaOptions: Select2Option[];
  disciplineOptions: Select2Option[];
  degreeLevelOptions: Select2Option[];
  languageOptions: Select2Option[];
  optionsLoading?: boolean;
  onChange: (key: string, value: unknown) => void;
};

export function ManageUniversityForm({
  form,
  formErrors,
  editing,
  universityOptions,
  studyAreaOptions,
  disciplineOptions,
  degreeLevelOptions,
  languageOptions,
  optionsLoading = false,
  onChange,
}: ManageUniversityFormProps) {
  const offerings = useMemo(
    () =>
      Array.isArray(form.offerings)
        ? (form.offerings as ManageOfferingForm[])
        : [emptyManageOffering()],
    [form.offerings]
  );

  const fieldByKey = useMemo(
    () => new Map(UNIVERSITY_MANAGE_FORM_FIELDS.map((field) => [field.key, field])),
    []
  );

  const inputClass = (error?: string) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
      error ? "border-red-400" : "border-slate-300"
    }`;

  const updateOffering = (index: number, key: keyof ManageOfferingForm, value: unknown) => {
    const next = offerings.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [key]: value } : row
    );
    onChange("offerings", next);
  };

  const addOffering = () => {
    onChange("offerings", [...offerings, emptyManageOffering()]);
  };

  const removeOffering = (index: number) => {
    if (offerings.length <= 1) return;
    onChange(
      "offerings",
      offerings.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <FormFieldLabel field={{ label: "University", required: true }} />
        <Select2
          options={universityOptions}
          value={String(form.universityId ?? "")}
          onChange={(value) => onChange("universityId", value)}
          placeholder="Select university…"
          searchPlaceholder="Search universities…"
          error={formErrors.universityId}
          loading={optionsLoading}
          disabled={editing}
        />
        <FormFieldHint
          hint={
            editing
              ? "University cannot be changed after create. Delete this row and add a new manage record if needed."
              : "Pick a university from the Universities page. Create the university there first if it does not exist."
          }
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Offerings</h3>
            <p className="text-xs text-slate-500">
              Each row becomes one program card on /universities.
            </p>
          </div>
          <button
            type="button"
            onClick={addOffering}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Add offering <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {formErrors.offerings ? (
          <p className="text-sm text-red-600">{formErrors.offerings}</p>
        ) : null}

        {offerings.map((offering, index) => (
          <div
            key={`offering-${index}`}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Offering {index + 1}
              </p>
              {offerings.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeOffering(index)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <FormFieldLabel field={{ label: "Study Area", required: true }} />
                <Select2
                  options={studyAreaOptions}
                  value={String(offering.studyAreaId ?? "")}
                  onChange={(value) => updateOffering(index, "studyAreaId", value)}
                  placeholder="Select study area…"
                  searchPlaceholder="Search study areas…"
                  error={formErrors[`offerings.${index}.studyAreaId`]}
                  loading={optionsLoading}
                />
              </div>

              <div>
                <FormFieldLabel field={{ label: "Discipline" }} />
                <Select2
                  options={disciplineOptions}
                  value={String(offering.disciplineId ?? "")}
                  onChange={(value) => updateOffering(index, "disciplineId", value)}
                  placeholder="Select discipline…"
                  searchPlaceholder="Search disciplines…"
                  loading={optionsLoading}
                />
              </div>

              <div>
                <FormFieldLabel field={fieldByKey.get("categoryId")!} />
                <Select2
                  options={degreeLevelOptions}
                  value={String(offering.categoryId ?? "")}
                  onChange={(value) => updateOffering(index, "categoryId", value)}
                  placeholder="Select degree level…"
                  searchPlaceholder="Search degree levels…"
                  error={formErrors[`offerings.${index}.categoryId`]}
                  loading={optionsLoading}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <FormFieldLabel field={fieldByKey.get("year")!} />
                <input
                  type="text"
                  value={String(offering.year ?? "")}
                  onChange={(e) => updateOffering(index, "year", e.target.value)}
                  placeholder={fieldByKey.get("year")?.placeholder}
                  className={inputClass()}
                />
                <FormFieldHint hint={fieldByKey.get("year")?.hint} />
              </div>

              <div>
                <FormFieldLabel field={fieldByKey.get("languageIds")!} />
                <MultiSelect2
                  options={languageOptions}
                  values={Array.isArray(offering.languageIds) ? offering.languageIds : []}
                  onChange={(values) => updateOffering(index, "languageIds", values)}
                  placeholder="Select languages…"
                  searchPlaceholder="Search languages…"
                  loading={optionsLoading}
                />
              </div>

              <div>
                <FormFieldLabel field={fieldByKey.get("feePerYear")!} />
                <input
                  type="text"
                  value={String(offering.feePerYear ?? "")}
                  onChange={(e) => updateOffering(index, "feePerYear", e.target.value)}
                  placeholder={fieldByKey.get("feePerYear")?.placeholder}
                  className={inputClass()}
                />
              </div>
            </div>

            <div className="mt-4">
              <FormFieldLabel field={fieldByKey.get("website")!} />
              <input
                type="text"
                value={String(offering.website ?? "")}
                onChange={(e) => updateOffering(index, "website", e.target.value)}
                placeholder={fieldByKey.get("website")?.placeholder}
                className={inputClass()}
              />
              <FormFieldHint hint={fieldByKey.get("website")?.hint} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
