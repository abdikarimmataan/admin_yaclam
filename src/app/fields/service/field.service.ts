import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated, queryString } from "@/config/pagination";
import { FIELD_API_PATH, type FieldRecord } from "@/app/fields/model/field.model";

export const fieldApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<FieldRecord> | { message?: string }>(
        `${FIELD_API_PATH}/getAll${queryString(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<FieldRecord>(`${FIELD_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<FieldRecord, Record<string, unknown>>(`${FIELD_API_PATH}/create`, body);
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<FieldRecord, Record<string, unknown>>(
      `${FIELD_API_PATH}/update/${id}`,
      body
    );
  },
  updateStatus(id: string, isVisible: boolean) {
    return api.patch<FieldRecord, { isVisible: boolean }>(
      `${FIELD_API_PATH}/updateStatus/${id}`,
      { isVisible }
    );
  },
};
