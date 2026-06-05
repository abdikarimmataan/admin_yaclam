import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated, queryString } from "@/config/pagination";
import {
  SCHOLARSHIP_API_PATH,
  type ScholarshipRecord,
} from "@/app/scholarship/model/scholarship.model";

export const scholarshipApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<ScholarshipRecord> | { message?: string }>(
        `${SCHOLARSHIP_API_PATH}/getAll${queryString(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<ScholarshipRecord>(`${SCHOLARSHIP_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<ScholarshipRecord, Record<string, unknown>>(
      `${SCHOLARSHIP_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<ScholarshipRecord, Record<string, unknown>>(
      `${SCHOLARSHIP_API_PATH}/update/${id}`,
      body
    );
  },
};
