"use client";

import { Pencil, BookOpen, Eye, FileStack } from "lucide-react";
import type { CourseRecord } from "@/app/courses/model/course.model";
import {
  getCourseFieldName,
  getCourseLabel,
} from "@/app/courses/model/course.model";

type CourseTableProps = {
  loading: boolean;
  paginated: CourseRecord[];
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
  onEdit: (item: CourseRecord) => void;
  onShow: (item: CourseRecord) => void;
  onCurriculum: (item: CourseRecord) => void;
  onResources: (item: CourseRecord) => void;
  onToggleVisible: (item: CourseRecord) => void;
};

export function CourseTable({
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
  onShow,
  onCurriculum,
  onResources,
  onToggleVisible,
}: CourseTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter courses..."
          className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 sm:w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              {["No.", "Title", "Field", "Visible", "Actions"].map((h) => (
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
                <td colSpan={6} className="px-3 py-10 text-center text-xs text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-xs text-slate-500">
                  No courses found
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
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {getCourseLabel(item)}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{getCourseFieldName(item)}</td>
                    <td className="px-3 py-2">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          disabled={busyId === item.id}
                          onChange={() => onToggleVisible(item)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 disabled:opacity-50"
                          aria-label={`Toggle visibility for ${getCourseLabel(item)}`}
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
                          onClick={() => onShow(item)}
                          disabled={busyId === item.id}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                          title="Show preview"
                        >
                          <Eye className="h-4 w-4" />
                          Show
                        </button>
                        <button
                          type="button"
                          onClick={() => onResources(item)}
                          disabled={busyId === item.id}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          title="Resources"
                        >
                          <FileStack className="h-4 w-4" />
                          Resources
                        </button>
                        <button
                          type="button"
                          onClick={() => onCurriculum(item)}
                          disabled={busyId === item.id}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                          title="Curriculum"
                        >
                          <BookOpen className="h-4 w-4" />
                          Curriculum
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          disabled={busyId === item.id}
                          className="inline-flex items-center rounded p-1.5 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
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
