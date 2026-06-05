"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  emptyFooterColumn,
  emptyFooterLink,
  normalizeFooterColumns,
  type FooterColumnItem,
  type FooterLinkItem,
} from "@/app/frontend/CMS/lib/footer-columns-list";

type FooterColumnsEditorProps = {
  label: string;
  value: unknown;
  error?: string;
  onChange: (items: FooterColumnItem[]) => void;
};

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function FooterColumnsEditor({ label, value, error, onChange }: FooterColumnsEditorProps) {
  const columns = normalizeFooterColumns(value);
  const rows = columns.length ? columns : [emptyFooterColumn()];

  const updateColumn = (index: number, patch: Partial<FooterColumnItem>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const updateLink = (colIndex: number, linkIndex: number, patch: Partial<FooterLinkItem>) => {
    const col = rows[colIndex];
    const links = col.links.map((link, i) =>
      i === linkIndex ? { ...link, ...patch } : link
    );
    updateColumn(colIndex, { links });
  };

  const addColumn = () => onChange([...rows, emptyFooterColumn()]);

  const removeColumn = (index: number) => {
    if (rows.length <= 1) {
      onChange([emptyFooterColumn()]);
      return;
    }
    onChange(rows.filter((_, i) => i !== index));
  };

  const addLink = (colIndex: number) => {
    const col = rows[colIndex];
    updateColumn(colIndex, { links: [...col.links, emptyFooterLink()] });
  };

  const removeLink = (colIndex: number, linkIndex: number) => {
    const col = rows[colIndex];
    if (col.links.length <= 1) {
      updateColumn(colIndex, { links: [emptyFooterLink()] });
      return;
    }
    updateColumn(colIndex, {
      links: col.links.filter((_, i) => i !== linkIndex),
    });
  };

  return (
    <div className="sm:col-span-2">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-white px-3 py-2.5 sm:px-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">Link columns shown in the site footer</p>
          </div>
          <button
            type="button"
            onClick={addColumn}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add column
          </button>
        </div>

        <div className="space-y-4 p-3 sm:p-4">
          {rows.map((col, colIndex) => (
            <div
              key={colIndex}
              className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Column title
                  </label>
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => updateColumn(colIndex, { title: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Platform"
                  />
                </div>
                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={col.isVisible}
                    onChange={(e) => updateColumn(colIndex, { isVisible: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  Column visible
                </label>
                <button
                  type="button"
                  onClick={() => removeColumn(colIndex)}
                  className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove column"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Links
                  </p>
                  <button
                    type="button"
                    onClick={() => addLink(colIndex)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    + Add link
                  </button>
                </div>
                {col.links.map((link, linkIndex) => (
                  <div
                    key={linkIndex}
                    className="grid grid-cols-1 gap-2 rounded-md bg-gray-50/80 p-2 sm:grid-cols-12 sm:items-center"
                  >
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          updateLink(colIndex, linkIndex, { label: e.target.value })
                        }
                        className={inputClass}
                        placeholder="Label"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) =>
                          updateLink(colIndex, linkIndex, { url: e.target.value })
                        }
                        className={inputClass}
                        placeholder="/path"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:col-span-3">
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={link.isVisible}
                          onChange={(e) =>
                            updateLink(colIndex, linkIndex, { isVisible: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        Visible
                      </label>
                      <button
                        type="button"
                        onClick={() => removeLink(colIndex, linkIndex)}
                        className="rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-red-600"
                        aria-label="Remove link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
