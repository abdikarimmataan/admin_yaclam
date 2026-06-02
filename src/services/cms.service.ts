import { api } from "@/api/http";
import type { CmsRecord, PaginatedResponse } from "@/model/api";
import { normalizePaginated, queryString } from "@/lib/pagination";

export function createCmsApi(basePath: string) {
  return {
    getAll(params: { page?: number; pageSize?: number } = {}) {
      return api
        .get<PaginatedResponse<CmsRecord> | { message?: string }>(
          `${basePath}/getAll${queryString(params)}`
        )
        .then(normalizePaginated);
    },
    getById(id: string) {
      return api.get<CmsRecord>(`${basePath}/getById/${id}`);
    },
    create(body: Record<string, unknown>) {
      return api.post<CmsRecord, Record<string, unknown>>(`${basePath}/create`, body);
    },
    update(id: string, body: Record<string, unknown>) {
      return api.patch<CmsRecord, Record<string, unknown>>(`${basePath}/update/${id}`, body);
    },
    updateStatus(id: string, status: boolean) {
      return api.patch<CmsRecord, { status: boolean }>(`${basePath}/status/${id}`, {
        status,
      });
    },
    remove(id: string) {
      return api.delete<{ message?: string }>(`${basePath}/delete/${id}`);
    },
  };
}
