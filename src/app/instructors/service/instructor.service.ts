import { api } from "@/config/api";
import type { ApiError, PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import { normalizeCmsRecord } from "@/app/frontend/CMS/lib/cms-record";
import { store } from "@/util/storage";
import {
  INSTRUCTOR_API_PATH,
  type InstructorRecord,
} from "@/app/instructors/model/instructor.model";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api";

function listQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}`;
}

function authHeaders(): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const token = store.getValidAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function uploadPhotoFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("photo", file);

  const res = await fetch(`${API_BASE_URL}${INSTRUCTOR_API_PATH}/upload/photo`, {
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

  const data = (await res.json()) as { photo?: string };
  return String(data.photo ?? "");
}

export const instructorApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<InstructorRecord> | { message?: string }>(
        `${INSTRUCTOR_API_PATH}/getAll${listQuery(params)}`
      )
      .then(normalizePaginated);
  },

  getById(id: string) {
    return api
      .get<InstructorRecord>(`${INSTRUCTOR_API_PATH}/getById/${id}`)
      .then((row) => normalizeCmsRecord(row) as InstructorRecord);
  },

  create(body: Record<string, unknown>) {
    return api.post<InstructorRecord, Record<string, unknown>>(
      `${INSTRUCTOR_API_PATH}/create`,
      body
    );
  },

  update(id: string, body: Record<string, unknown>) {
    return api.patch<InstructorRecord, Record<string, unknown>>(
      `${INSTRUCTOR_API_PATH}/update/${id}`,
      body
    );
  },

  updateStatus(id: string, status: "active" | "inactive") {
    return api.patch<InstructorRecord, { status: "active" | "inactive" }>(
      `${INSTRUCTOR_API_PATH}/update/${id}`,
      { status }
    );
  },

  remove(id: string) {
    return api.delete<{ message?: string }>(`${INSTRUCTOR_API_PATH}/delete/${id}`);
  },

  uploadPhoto(file: File) {
    return uploadPhotoFile(file);
  },
};
