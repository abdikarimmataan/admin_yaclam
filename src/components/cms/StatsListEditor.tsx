"use client";

import { Plus, Trash2 } from "lucide-react";
import { emptyStatItem, normalizeStatsItems, type StatItem } from "@/lib/stats-list";

type StatsListEditorProps = {
  label: string;
  value: unknown;
  error?: string;
  onChange: (items: StatItem[]) => void;
};

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function StatsListEditor({ label, value, error, onChange }: StatsListEditorProps) {
  const items = normalizeStatsItems(value);
  const rows = items.length ? items : [emptyStatItem()];

  const updateRow = (index: number, patch: Partial<StatItem>) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const addRow = () => {
    onChange([...rows, emptyStatItem()]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) {
      onChange([emptyStatItem()]);
      return;
    }
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="sm:col-span-2">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-white px-3 py-2.5 sm:px-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">Add numbers or labels shown on the home page</p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add stat
          </button>
        </div>

        <div className="hidden border-b border-gray-100 bg-gray-50/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:grid sm:grid-cols-12 sm:gap-2 sm:px-4">
          <div className="sm:col-span-3">Value</div>
          <div className="sm:col-span-6">Label</div>
          <div className="sm:col-span-2 text-center">Visible</div>
          <div className="sm:col-span-1" />
        </div>

        <div className="divide-y divide-gray-100 px-3 py-2 sm:px-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-2 py-2.5 sm:grid-cols-12 sm:items-center sm:gap-2"
            >
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-gray-600 sm:sr-only">
                  Value
                </label>
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => updateRow(index, { value: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 10K+"
                />
              </div>
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium text-gray-600 sm:sr-only">
                  Label
                </label>
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateRow(index, { label: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Learners"
                />
              </div>
              <div className="flex items-center justify-between gap-2 sm:col-span-3">
                <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 sm:min-w-[7.5rem]">
                  <input
                    type="checkbox"
                    checked={row.isVisible}
                    onChange={(e) => updateRow(index, { isVisible: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium">
                    {row.isVisible ? "Visible" : "Hidden"}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="inline-flex shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove stat"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">
            No stats yet. Click <span className="font-medium text-blue-600">Add stat</span> to
            create one.
          </p>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
