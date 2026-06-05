"use client";

import { Plus, Trash2 } from "lucide-react";
import type { RoadmapStep } from "@/app/roadmap/model/roadmap.model";

type RoadmapLearningPathEditorProps = {
  value: unknown;
  error?: string;
  onChange: (steps: RoadmapStep[]) => void;
};

function normalizeSteps(value: unknown): RoadmapStep[] {
  if (Array.isArray(value)) {
    return value.map((row, index) => {
      const step = row as RoadmapStep & { description?: string };
      return {
        title: String(step.title ?? ""),
        detail: String(step.detail ?? step.description ?? ""),
        order: Number.isFinite(Number(step.order)) ? Number(step.order) : index,
        isVisible: step.isVisible !== false,
      };
    });
  }
  return [];
}

function emptyStep(order: number): RoadmapStep {
  return { title: "", detail: "", order, isVisible: true };
}

export function RoadmapLearningPathEditor({
  value,
  error,
  onChange,
}: RoadmapLearningPathEditorProps) {
  const steps = normalizeSteps(value);

  const update = (next: RoadmapStep[]) => {
    onChange(next.map((step, index) => ({ ...step, order: index })));
  };

  const updateAt = (index: number, patch: Partial<RoadmapStep>) => {
    const next = [...steps];
    next[index] = { ...next[index], ...patch };
    update(next);
  };

  const add = () => update([...steps, emptyStep(steps.length)]);

  const remove = (index: number) => {
    update(steps.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Learning Path</label>
      <div className="space-y-3">
        {steps.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            No learning path steps yet.
          </p>
        ) : (
          steps.map((step, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500">Step {index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                  aria-label={`Remove step ${index + 1}`}
                  title="Remove step"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={step.title ?? ""}
                onChange={(e) => updateAt(index, { title: e.target.value })}
                placeholder="Step title, e.g. Foundations"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
              />
              <textarea
                rows={2}
                value={step.detail ?? ""}
                onChange={(e) => updateAt(index, { detail: e.target.value })}
                placeholder="What the learner does in this step"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
              />
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={step.isVisible !== false}
                  onChange={(e) => updateAt(index, { isVisible: e.target.checked })}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
                />
                Visible on site
              </label>
            </div>
          ))
        )}
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add step
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
