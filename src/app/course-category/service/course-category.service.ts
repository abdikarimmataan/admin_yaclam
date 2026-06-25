import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import {
  COURSE_CATEGORY_API_PATH,
  type CourseCategoryRecord,
} from "@/app/course-category/model/course-category.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true`;
}

export const courseCategoryApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<CourseCategoryRecord> | { message?: string }>(
        `${COURSE_CATEGORY_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<CourseCategoryRecord>(`${COURSE_CATEGORY_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<CourseCategoryRecord, Record<string, unknown>>(
      `${COURSE_CATEGORY_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<CourseCategoryRecord, Record<string, unknown>>(
      `${COURSE_CATEGORY_API_PATH}/update/${id}`,
      body
    );
  },
  updateVisible(id: string, isVisible: boolean) {
    return api.patch<CourseCategoryRecord, { isVisible: boolean }>(
      `${COURSE_CATEGORY_API_PATH}/status/${id}`,
      { isVisible }
    );
  },
};
