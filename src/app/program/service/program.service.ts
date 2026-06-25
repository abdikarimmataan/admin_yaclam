import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import { PROGRAM_API_PATH, type ProgramRecord } from "@/app/program/model/program.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true`;
}

export const programApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<ProgramRecord> | { message?: string }>(
        `${PROGRAM_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<ProgramRecord>(`${PROGRAM_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<ProgramRecord, Record<string, unknown>>(
      `${PROGRAM_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<ProgramRecord, Record<string, unknown>>(
      `${PROGRAM_API_PATH}/update/${id}`,
      body
    );
  },
  updateVisible(id: string, isVisible: boolean) {
    return api.patch<ProgramRecord, { isVisible: boolean }>(
      `${PROGRAM_API_PATH}/status/${id}`,
      { isVisible }
    );
  },
  delete(id: string) {
    return api.delete<{ message?: string }>(`${PROGRAM_API_PATH}/delete/${id}`);
  },
};
