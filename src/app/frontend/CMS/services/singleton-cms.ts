import type { ApiError, CmsRecord } from "@/config/api";
import { createCmsApi } from "@/app/frontend/CMS/services/cms-api";
import { normalizeCmsRecord } from "@/app/frontend/CMS/lib/cms-record";

export type LoadSingletonResult = {
  record: CmsRecord | null;
  error?: string;
};

export async function loadSingleton(apiPath: string): Promise<LoadSingletonResult> {
  const cmsApi = createCmsApi(apiPath);
  try {
    const res = await cmsApi.getAll({ page: 1, pageSize: 100 });
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

export async function saveSingleton(
  apiPath: string,
  recordId: string | null | undefined,
  payload: Record<string, unknown>
): Promise<CmsRecord> {
  const cmsApi = createCmsApi(apiPath);
  const saved = recordId
    ? await cmsApi.update(recordId, payload)
    : await cmsApi.create(payload);
  const normalized = normalizeCmsRecord(saved);
  if (!normalized) {
    throw { status: 0, message: "Invalid response from server" } as ApiError;
  }
  return normalized;
}
