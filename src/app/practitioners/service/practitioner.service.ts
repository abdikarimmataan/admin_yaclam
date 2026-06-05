import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import {
  PRACTITIONER_API_PATH,
  type PractitionerRecord,
} from "@/app/practitioners/model/practitioner.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true`;
}

export const practitionerApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<PractitionerRecord> | { message?: string }>(
        `${PRACTITIONER_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<PractitionerRecord>(`${PRACTITIONER_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<PractitionerRecord, Record<string, unknown>>(
      `${PRACTITIONER_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<PractitionerRecord, Record<string, unknown>>(
      `${PRACTITIONER_API_PATH}/update/${id}`,
      body
    );
  },
  updateVisible(id: string, isVisible: boolean) {
    return api.patch<PractitionerRecord, { isVisible: boolean }>(
      `${PRACTITIONER_API_PATH}/status/${id}`,
      { isVisible }
    );
  },
};
