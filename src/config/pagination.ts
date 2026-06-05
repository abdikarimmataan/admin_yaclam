import { extractCmsRecords } from "@/app/frontend/CMS/lib/cms-record";
import type { PaginatedResponse } from "@/config/api";

export function normalizePaginated<T>(
  res: PaginatedResponse<T> | { message?: string } | unknown
): PaginatedResponse<T> {
  if (
    res &&
    typeof res === "object" &&
    "data" in res &&
    Array.isArray((res as PaginatedResponse<T>).data)
  ) {
    return res as PaginatedResponse<T>;
  }
  const data = extractCmsRecords(res) as T[];
  if (res && typeof res === "object" && "page" in res) {
    const p = res as PaginatedResponse<T>;
    return { ...p, data, rows: data.length || p.rows };
  }
  return {
    page: 1,
    pages: data.length ? 1 : 0,
    pageSize: 10,
    rows: data.length,
    data,
  };
}

export function queryString(params: { page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  return `?page=${page}&pageSize=${pageSize}`;
}
