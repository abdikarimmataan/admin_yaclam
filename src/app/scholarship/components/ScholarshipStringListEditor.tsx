"use client";

import { Plus, Trash2 } from "lucide-react";

type ScholarshipStringListEditorProps = {
  label: string;
  addLabel: string;
  placeholder?: string;
  value: unknown;
  error?: string;
  onChange: (items: string[]) => void;
};

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((s) => String(s ?? ""));
  if (typeof value === "string" && value.trim()) {
    if (value.includes("\n")) {
      return value.split("\n").map((s) => s.trim());
    }
    return value.split(",").map((s) => s.trim());
  }
  return [];
}

export function ScholarshipStringListEditor({
  label,
  addLabel,
  placeholder = "e.g. Full tuition",
  value,
  error,
  onChange,
}: ScholarshipStringListEditorProps) {
  const items = normalizeList(value);

  const updateAt = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(next);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            No items added yet.
          </p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateAt(index, e.target.value)}
                placeholder={placeholder}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                aria-label={`Remove ${label} item`}
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
