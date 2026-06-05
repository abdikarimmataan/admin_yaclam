import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated, queryString } from "@/config/pagination";
import { YACLAM_API_PATH, type YaclamRecord } from "@/app/yaclam/model/yaclam.model";

export const yaclamApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<YaclamRecord> | { message?: string }>(
        `${YACLAM_API_PATH}/getAll${queryString(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<YaclamRecord>(`${YACLAM_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<YaclamRecord, Record<string, unknown>>(`${YACLAM_API_PATH}/create`, body);
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<YaclamRecord, Record<string, unknown>>(
      `${YACLAM_API_PATH}/update/${id}`,
      body
    );
  },
};
