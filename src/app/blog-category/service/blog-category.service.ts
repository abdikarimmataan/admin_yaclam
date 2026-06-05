import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import {
  BLOG_CATEGORY_API_PATH,
  type BlogCategoryRecord,
} from "@/app/blog-category/model/blog-category.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true`;
}

export const blogCategoryApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<BlogCategoryRecord> | { message?: string }>(
        `${BLOG_CATEGORY_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<BlogCategoryRecord>(`${BLOG_CATEGORY_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<BlogCategoryRecord, Record<string, unknown>>(
      `${BLOG_CATEGORY_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<BlogCategoryRecord, Record<string, unknown>>(
      `${BLOG_CATEGORY_API_PATH}/update/${id}`,
      body
    );
  },
  updateVisible(id: string, isVisible: boolean) {
    return api.patch<BlogCategoryRecord, { isVisible: boolean }>(
      `${BLOG_CATEGORY_API_PATH}/status/${id}`,
      { isVisible }
    );
  },
};
