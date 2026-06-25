import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import {
  UNIVERSITY_API_PATH,
  type UniversityRecord,
} from "@/app/university/model/university.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true`;
}

export const universityApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<UniversityRecord> | { message?: string }>(
        `${UNIVERSITY_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<UniversityRecord>(`${UNIVERSITY_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<UniversityRecord, Record<string, unknown>>(
      `${UNIVERSITY_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<UniversityRecord, Record<string, unknown>>(
      `${UNIVERSITY_API_PATH}/update/${id}`,
      body
    );
  },
  updateVisible(id: string, isVisible: boolean) {
    return api.patch<UniversityRecord, { isVisible: boolean }>(
      `${UNIVERSITY_API_PATH}/status/${id}`,
      { isVisible }
    );
  },
  delete(id: string) {
    return api.delete<{ message?: string }>(`${UNIVERSITY_API_PATH}/delete/${id}`);
  },
};
