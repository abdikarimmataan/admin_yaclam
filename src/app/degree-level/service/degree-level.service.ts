import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import {
  DEGREE_LEVEL_API_PATH,
  type DegreeLevelRecord,
} from "@/app/degree-level/model/degree-level.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true`;
}

export const degreeLevelApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<DegreeLevelRecord> | { message?: string }>(
        `${DEGREE_LEVEL_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<DegreeLevelRecord>(`${DEGREE_LEVEL_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<DegreeLevelRecord, Record<string, unknown>>(
      `${DEGREE_LEVEL_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<DegreeLevelRecord, Record<string, unknown>>(
      `${DEGREE_LEVEL_API_PATH}/update/${id}`,
      body
    );
  },
  updateVisible(id: string, isVisible: boolean) {
    return api.patch<DegreeLevelRecord, { isVisible: boolean }>(
      `${DEGREE_LEVEL_API_PATH}/status/${id}`,
      { isVisible }
    );
  },
  delete(id: string) {
    return api.delete<{ message?: string }>(`${DEGREE_LEVEL_API_PATH}/delete/${id}`);
  },
};
