import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import { normalizeCmsRecord } from "@/app/frontend/CMS/lib/cms-record";
import {
  INSTRUCTOR_ROLE_API_PATH,
  type InstructorRoleRecord,
} from "@/app/instructor-roles/model/instructor-role.model";

function listQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}`;
}

export const instructorRoleApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<InstructorRoleRecord> | { message?: string }>(
        `${INSTRUCTOR_ROLE_API_PATH}/getAll${listQuery(params)}`
      )
      .then(normalizePaginated);
  },

  getById(id: string) {
    return api
      .get<InstructorRoleRecord>(`${INSTRUCTOR_ROLE_API_PATH}/getById/${id}`)
      .then((row) => normalizeCmsRecord(row) as InstructorRoleRecord);
  },

  create(body: Record<string, unknown>) {
    return api.post<InstructorRoleRecord, Record<string, unknown>>(
      `${INSTRUCTOR_ROLE_API_PATH}/create`,
      body
    );
  },

  update(id: string, body: Record<string, unknown>) {
    return api.patch<InstructorRoleRecord, Record<string, unknown>>(
      `${INSTRUCTOR_ROLE_API_PATH}/update/${id}`,
      body
    );
  },

  remove(id: string) {
    return api.delete<{ message?: string }>(`${INSTRUCTOR_ROLE_API_PATH}/delete/${id}`);
  },
};
