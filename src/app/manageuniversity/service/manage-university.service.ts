import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import {
  MANAGE_UNIVERSITY_API_PATH,
  type ManageUniversityRecord,
} from "@/app/manageuniversity/model/manage-university.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}`;
}

export const manageUniversityApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<ManageUniversityRecord> | { message?: string }>(
        `${MANAGE_UNIVERSITY_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<ManageUniversityRecord>(`${MANAGE_UNIVERSITY_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<ManageUniversityRecord, Record<string, unknown>>(
      `${MANAGE_UNIVERSITY_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<ManageUniversityRecord, Record<string, unknown>>(
      `${MANAGE_UNIVERSITY_API_PATH}/update/${id}`,
      body
    );
  },
  delete(id: string) {
    return api.delete<{ message?: string }>(`${MANAGE_UNIVERSITY_API_PATH}/delete/${id}`);
  },
};
