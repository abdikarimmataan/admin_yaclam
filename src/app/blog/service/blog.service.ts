import { api } from "@/config/api";
import type { ApiError, PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import { store } from "@/util/storage";
import { BLOG_POST_API_PATH, type BlogPostRecord } from "@/app/blog/model/blog.model";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true&includeDrafts=true`;
}

function adminByIdQuery() {
  return "?includeHidden=true&includeDrafts=true";
}

function authHeaders(): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const token = store.getValidAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function uploadCoverImageFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("coverImage", file);

  const res = await fetch(`${API_BASE_URL}${BLOG_POST_API_PATH}/upload/cover`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });

  if (!res.ok) {
    let message = res.statusText || "Upload failed";
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw { status: res.status, message } as ApiError;
  }

  const data = (await res.json()) as { coverImage?: string };
  return String(data.coverImage ?? "");
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
  remove(id: string) {
    return api.delete<{ message?: string }>(`${BLOG_POST_API_PATH}/delete/${id}`);
  },
  uploadCoverImage(file: File) {
    return uploadCoverImageFile(file);
  },
};
