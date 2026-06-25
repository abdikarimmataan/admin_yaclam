"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, LayoutGrid } from "lucide-react";

const MIN_GRID = 1;
const MAX_GRID = 6;

function clampGrid(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_GRID, Math.max(MIN_GRID, Math.floor(n)));
}

function columnFraction(columns: number): string {
  if (columns <= 1) return "100%";
  return `${Math.round(100 / columns)}%`;
}

function rowHeightLabel(rows: number, index: number): string {
  if (rows === 2) return index === 0 ? "1/3 height" : "2/3 height";
  return `1/${rows} height`;
}

type FeaturedCoursesGridPreviewProps = {
  rows: unknown;
  columns: unknown;
};

export function FeaturedCoursesGridPreview({ rows, columns }: FeaturedCoursesGridPreviewProps) {
  const [open, setOpen] = useState(false);

  const gridRows = clampGrid(rows, 2);
  const gridColumns = clampGrid(columns, 3);
  const cardsPerPage = gridRows * gridColumns;

  const rowTemplate = useMemo(() => {
    if (gridRows === 2) return "1fr 2fr";
    return `repeat(${gridRows}, 1fr)`;
  }, [gridRows]);

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Website layout preview</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {gridRows} row{gridRows !== 1 ? "s" : ""} × {gridColumns} column
            {gridColumns !== 1 ? "s" : ""} = {cardsPerPage} card{cardsPerPage !== 1 ? "s" : ""} per page
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-md border border-violet-300 bg-white px-3.5 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
        >
          {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {open ? "Hide preview" : "Preview website layout"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-slate-50 px-4 py-2.5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <LayoutGrid className="h-3.5 w-3.5" />
              Desktop view (lg breakpoint)
            </p>
          </div>

          <div className="p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {Array.from({ length: gridColumns }, (_, i) => (
                <span
                  key={`col-label-${i}`}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700"
                >
                  Col {i + 1}: {columnFraction(gridColumns)} width
                </span>
              ))}
            </div>

            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                gridTemplateRows: rowTemplate,
                minHeight: gridRows === 2 ? 280 : gridRows * 120,
              }}
            >
              {Array.from({ length: cardsPerPage }, (_, index) => {
                const rowIndex = Math.floor(index / gridColumns);
                return (
                  <div
                    key={`preview-card-${index}`}
                    className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="h-10 rounded-lg bg-slate-200/80" />
                      <div className="h-2 w-4/5 rounded bg-slate-200" />
                      <div className="h-2 w-3/5 rounded bg-slate-100" />
                    </div>
                    <p className="mt-2 text-[10px] font-medium text-slate-400">
                      Card {index + 1} · Row {rowIndex + 1} · {rowHeightLabel(gridRows, rowIndex)}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-gray-500">
              On mobile the grid stacks to 1 column; on tablet it uses 2 columns. Pagination appears when
              there are more courses than {cardsPerPage}.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
