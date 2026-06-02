import type { ApiError } from "@/api/http";
import type { CmsRecord } from "@/model/api";
import { normalizeCmsRecord } from "@/lib/cms-record";
import { createCmsApi } from "@/services/cms.service";

export type LoadSingletonResult = {
  record: CmsRecord | null;
  error?: string;
};

/** Load the newest live singleton row; never throws (safe after Postman edits). */
export async function loadSingleton(apiPath: string): Promise<LoadSingletonResult> {
  const api = createCmsApi(apiPath);
  try {
    const res = await api.getAll({ page: 1, pageSize: 100 });
    const raw = res.data?.[0];
    const record = raw ? normalizeCmsRecord(raw) : null;
    return { record };
  } catch (err) {
    const e = err as ApiError;
    if (e.status === 404 || /no data/i.test(e.message ?? "")) {
      return { record: null };
    }
    return {
      record: null,
      error: e.message || "Failed to load data from server",
    };
  }
}

/** Create via POST /create or update via PATCH /update/:id */
export async function saveSingleton(
  apiPath: string,
  recordId: string | null | undefined,
  payload: Record<string, unknown>
): Promise<CmsRecord> {
  const api = createCmsApi(apiPath);
  const saved = recordId
    ? await api.update(recordId, payload)
    : await api.create(payload);
  const normalized = normalizeCmsRecord(saved);
  if (!normalized) {
    throw { status: 0, message: "Invalid response from server" } as ApiError;
  }
  return normalized;
}
