"use client";

import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { IconSelectField } from "@/shared/components/IconSelectField";
import { RoadmapLearningPathEditor } from "@/app/roadmap/components/RoadmapLearningPathEditor";
import { RoadmapSkillsEditor } from "@/app/roadmap/components/RoadmapSkillsEditor";
import { ROADMAP_DEMAND_LEVELS, ROADMAP_FULL_WIDTH_KEYS } from "@/app/roadmap/model/roadmap.model";
import { getValueByPath } from "@/app/frontend/CMS/lib/cms-utils";
import { timeToJobReadyToDateInputValue } from "@/app/roadmap/validation/roadmap.validation";

const PLACEHOLDERS: Record<string, string> = {
  title: "e.g. Data Analyst",
  description: "Short summary of this career path.",
  salary: "e.g. €38k–€58k",
};

type RoadmapFormProps = {
  fields: FormField[];
  form: Record<string, unknown>;
  formErrors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
};

function RoadmapInput({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const inputClass = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
    error ? "border-red-400" : "border-slate-300"
  }`;

  if (field.key === "icon") {
    return (
      <IconSelectField
        label={field.label}
        required={field.required}
        value={String(value ?? "")}
        onChange={(v) => onChange(v)}
        error={error}
      />
    );
  }

  if (field.key === "demand") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <select
          value={String(value ?? "High")}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          {ROADMAP_DEMAND_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.key === "sortOrder") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 1"
          className={inputClass}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.key === "timeToJobReady") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type="date"
          value={timeToJobReadyToDateInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500">
          Saves to <code className="text-slate-600">timeToJobReady</code> as YYYY/MM/DD (not the legacy{" "}
          <code className="text-slate-600">months</code> field).
        </p>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <textarea
          rows={3}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDERS[field.key]}
          className={inputClass}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type="text"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PLACEHOLDERS[field.key]}
        className={inputClass}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function formFieldValue(form: Record<string, unknown>, key: string): unknown {
  if (key in form) return form[key];
  return getValueByPath(form, key);
}

function chunkFields<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function RoadmapForm({ fields, form, formErrors, onChange }: RoadmapFormProps) {
  const gridFields = fields.filter((f) => !ROADMAP_FULL_WIDTH_KEYS.has(f.key));
  const descriptionField = fields.find((f) => f.key === "description");
  const skillsField = fields.find((f) => f.key === "skills");
  const stepsField = fields.find((f) => f.key === "steps");
  const gridRows = chunkFields(gridFields, 3);

  return (
    <div className="space-y-4">
      {gridRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {row.map((field) => (
            <RoadmapInput
              key={field.key}
              field={field}
              value={formFieldValue(form, field.key)}
              error={formErrors[field.key]}
              onChange={(value) => onChange(field.key, value)}
            />
          ))}
        </div>
      ))}

      {descriptionField && (
        <RoadmapInput
          field={descriptionField}
          value={formFieldValue(form, descriptionField.key)}
          error={formErrors[descriptionField.key]}
          onChange={(value) => onChange(descriptionField.key, value)}
        />
      )}

      {skillsField && (
        <RoadmapSkillsEditor
          value={form.skills}
          error={formErrors.skills}
          onChange={(skills) => onChange("skills", skills)}
        />
      )}

      {stepsField && (
        <RoadmapLearningPathEditor
          value={form.steps}
          error={formErrors.steps}
          onChange={(steps) => onChange("steps", steps)}
        />
      )}
    </div>
  );
}
