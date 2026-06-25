import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import {
  UNIVERSITY_LOCATION_API_PATH,
  type UniversityLocationRecord,
} from "@/app/university-location/model/university-location.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true`;
}

export const universityLocationApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<UniversityLocationRecord> | { message?: string }>(
        `${UNIVERSITY_LOCATION_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<UniversityLocationRecord>(`${UNIVERSITY_LOCATION_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<UniversityLocationRecord, Record<string, unknown>>(
      `${UNIVERSITY_LOCATION_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<UniversityLocationRecord, Record<string, unknown>>(
      `${UNIVERSITY_LOCATION_API_PATH}/update/${id}`,
      body
    );
  },
  updateVisible(id: string, isVisible: boolean) {
    return api.patch<UniversityLocationRecord, { isVisible: boolean }>(
      `${UNIVERSITY_LOCATION_API_PATH}/status/${id}`,
      { isVisible }
    );
  },
  delete(id: string) {
    return api.delete<{ message?: string }>(`${UNIVERSITY_LOCATION_API_PATH}/delete/${id}`);
  },
};
