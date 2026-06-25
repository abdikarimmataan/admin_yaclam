"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { DisciplineRecord } from "@/app/discipline/model/discipline.model";
import { getDisciplineLabel } from "@/app/discipline/model/discipline.model";

type DisciplineTableProps = {
  loading: boolean;
  paginated: DisciplineRecord[];
  startIdx: number;
  search: string;
  page: number;
  pageSize: number;
  totalPages: number;
  filteredCount: number;
  busyId: string | null;
  canPrev: boolean;
  canNext: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (item: DisciplineRecord) => void;
  onDelete: (item: DisciplineRecord) => void;
  onToggleVisible: (item: DisciplineRecord) => void;
};

export function DisciplineTable({
  loading,
  paginated,
  startIdx,
  search,
  page,
  pageSize,
  totalPages,
  filteredCount,
  busyId,
  canPrev,
  canNext,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onToggleVisible,
}: DisciplineTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter disciplines..."
          className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 sm:w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              {["No.", "Name", "Visible", "Actions"].map((h) => (
                <th
                  key={h}
                  className={`px-3 py-2 text-left text-xs font-semibold text-slate-900 ${
                    h === "Actions" ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-10 text-center text-xs text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-10 text-center text-xs text-slate-500">
                  No disciplines found
                </td>
              </tr>
            ) : (
              paginated.map((item, i) => {
                const rowNum = startIdx + i + 1;
                const id = String(item.id ?? i);
                const isVisible = item.isVisible !== false;

                return (
                  <tr
                    key={id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80"
                  >
                    <td className="px-3 py-2 tabular-nums text-slate-700">{rowNum}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{getDisciplineLabel(item)}</td>
                    <td className="px-3 py-2">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          disabled={busyId === item.id}
                          onChange={() => onToggleVisible(item)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 disabled:opacity-50"
                          aria-label={`Toggle visibility for ${getDisciplineLabel(item)}`}
                        />
                        <span className="text-xs text-slate-600">
                          {isVisible ? "Visible" : "Hidden"}
                        </span>
                      </label>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          disabled={busyId === item.id}
                          className="inline-flex items-center rounded p-1.5 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          disabled={busyId === item.id}
                          className="inline-flex items-center rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredCount > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>Rows per page · {filteredCount} total</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => canPrev && onPageChange(page - 1)}
              disabled={!canPrev}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-2 text-xs text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => canNext && onPageChange(page + 1)}
              disabled={!canNext}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
