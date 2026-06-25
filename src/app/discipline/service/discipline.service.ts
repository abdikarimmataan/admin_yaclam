import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import { DISCIPLINE_API_PATH, type DisciplineRecord } from "@/app/discipline/model/discipline.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true`;
}

export const disciplineApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<DisciplineRecord> | { message?: string }>(
        `${DISCIPLINE_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<DisciplineRecord>(`${DISCIPLINE_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<DisciplineRecord, Record<string, unknown>>(
      `${DISCIPLINE_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<DisciplineRecord, Record<string, unknown>>(
      `${DISCIPLINE_API_PATH}/update/${id}`,
      body
    );
  },
  updateVisible(id: string, isVisible: boolean) {
    return api.patch<DisciplineRecord, { isVisible: boolean }>(
      `${DISCIPLINE_API_PATH}/status/${id}`,
      { isVisible }
    );
  },
  delete(id: string) {
    return api.delete<{ message?: string }>(`${DISCIPLINE_API_PATH}/delete/${id}`);
  },
};
