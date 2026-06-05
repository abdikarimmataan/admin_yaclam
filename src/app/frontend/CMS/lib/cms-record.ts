import type { CmsRecord, PaginatedResponse } from "@/config/api";

/** Normalize API rows (Postman / raw inserts may omit `id` or use `_id`). */
export function normalizeCmsRecord(raw: unknown): CmsRecord | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const id = row.id ?? row._id;
  if (id != null && row.id == null) {
    return { ...row, id: String(id) } as CmsRecord;
  }
  return row as CmsRecord;
}

/** Accept paginated lists or a single document body from the API. */
export function extractCmsRecords(res: unknown): CmsRecord[] {
  if (Array.isArray(res)) {
    return res.map(normalizeCmsRecord).filter((r): r is CmsRecord => r != null);
  }
  if (!res || typeof res !== "object") return [];
  const body = res as Record<string, unknown>;

  if (Array.isArray(body.data)) {
    return body.data.map(normalizeCmsRecord).filter((r): r is CmsRecord => r != null);
  }

  if (body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    const one = normalizeCmsRecord(body.data);
    return one ? [one] : [];
  }

  if (body.id != null || body._id != null) {
    const one = normalizeCmsRecord(body);
    return one ? [one] : [];
  }

  return [];
}

export function normalizePaginatedRecords<T>(
  res: PaginatedResponse<T> | { message?: string } | unknown
): PaginatedResponse<T> {
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
