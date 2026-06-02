"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  title?: string;
  data: T[];
  columns: Column<T>[];
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
  actions?: ReactNode;
};

export function DataTable<T>({
  title,
  data,
  columns,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  loading,
  actions,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalRows);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-2.5 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
          <p className="text-sm text-gray-500">Total: {totalRows}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
          />
          {actions}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead className="border-y border-gray-100 bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-500">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-left text-sm font-medium text-gray-500"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm tabular-nums text-gray-900">
                    {startIdx + i + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2.5 ${col.className ?? ""}`}
                    >
                      {col.render(row, startIdx + i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-2.5 border-t border-gray-100 px-4 py-2.5 sm:flex-row">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Items per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-gray-600">
            {totalRows === 0 ? "0 of 0" : `${startIdx + 1}-${endIdx} of ${totalRows}`}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => canPrev && onPageChange(page - 1)}
              disabled={!canPrev}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2.5 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => canNext && onPageChange(page + 1)}
              disabled={!canNext}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
