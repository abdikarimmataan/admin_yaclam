import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import { BLOG_POST_API_PATH, type BlogPostRecord } from "@/app/blog/model/blog.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true&includeDrafts=true`;
}

function adminByIdQuery() {
  return "?includeHidden=true&includeDrafts=true";
}

export const blogPostApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<BlogPostRecord> | { message?: string }>(
        `${BLOG_POST_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<BlogPostRecord>(`${BLOG_POST_API_PATH}/getById/${id}${adminByIdQuery()}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<BlogPostRecord, Record<string, unknown>>(
      `${BLOG_POST_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<BlogPostRecord, Record<string, unknown>>(
      `${BLOG_POST_API_PATH}/update/${id}`,
      body
    );
  },
  updateStatus(id: string, status: "draft" | "published") {
    return api.patch<BlogPostRecord, { status: "draft" | "published" }>(
      `${BLOG_POST_API_PATH}/status/${id}`,
      { status }
    );
  },
};
