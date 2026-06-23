import { store } from "@/util/storage";
import type { ApiError, PaginatedResponse } from "@/config/api";
import type { ValidationError } from "@/app/login/model/auth.model";
import { api } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import { normalizeCmsRecord } from "@/app/frontend/CMS/lib/cms-record";
import {
  COURSE_API_PATH,
  type CourseModule,
  type CourseRecord,
  type CourseResource,
} from "@/app/courses/model/course.model";
import type { ResourcesSavePayload } from "@/app/courses/validation/resources.validation";
import type { CurriculumSavePayload } from "@/app/courses/validation/curriculum.validation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api";

const JSON_BODY_KEYS = new Set([
  "overview",
  "curriculum",
  "resources",
  "resourceFileIndexes",
  "lessonVideoTargets",
  "details",
  "instructor",
  "badges",
  "ctaButton",
  "wishlistButton",
]);

export type CourseListParams = {
  page?: number;
  pageSize?: number;
  isFree?: boolean;
  isFeatured?: boolean;
  category?: string;
};

export type CourseUploadFiles = {
  thumbnail?: File | null;
  video?: File | null;
};

function buildQuery(params: CourseListParams = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.isFree === true) qs.set("isFree", "true");
  if (params.isFeatured === true) qs.set("isFeatured", "true");
  if (params.category?.trim()) qs.set("category", params.category.trim());
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function authHeaders(): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const token = store.getValidAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function formatApiFailure(body: unknown, fallback: string): ApiError {
  if (!body || typeof body !== "object") {
    return { status: 422, message: fallback };
  }

  const record = body as { message?: string; errors?: ValidationError[] };
  if (Array.isArray(record.errors) && record.errors.length > 0) {
    return {
      status: 422,
      message: record.errors.map((e) => `${e.field}: ${e.message}`).join("; "),
      errors: record.errors,
    };
  }

  if (typeof record.message === "string" && record.message.trim()) {
    return { status: 422, message: record.message };
  }

  return { status: 422, message: fallback };
}

async function parseCourseResponse(res: Response): Promise<CourseRecord> {
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const failure = formatApiFailure(body, res.statusText || "Request failed");
    throw { ...failure, status: res.status } as ApiError;
  }

  const text = await res.text();
  if (!text) {
    throw { status: 0, message: "Empty response from server" } as ApiError;
  }

  const data = JSON.parse(text);
  const normalized = normalizeCmsRecord(data);
  if (!normalized) {
    throw { status: 0, message: "Invalid response from server" } as ApiError;
  }
  return normalized as CourseRecord;
}

function appendPayloadToFormData(fd: FormData, payload: Record<string, unknown>) {
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (JSON_BODY_KEYS.has(key) && typeof value === "object") {
      fd.append(key, JSON.stringify(value));
      return;
    }
    if (typeof value === "boolean") {
      fd.append(key, value ? "true" : "false");
      return;
    }
    if (typeof value === "number" || typeof value === "string") {
      fd.append(key, String(value));
    }
  });
}

async function multipartSave(
  method: "POST" | "PATCH",
  path: string,
  payload: Record<string, unknown>,
  files: CourseUploadFiles
) {
  const fd = new FormData();
  appendPayloadToFormData(fd, payload);
  if (files.thumbnail) fd.append("thumbnail", files.thumbnail);
  if (files.video) fd.append("video", files.video);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: fd,
  });
  return parseCourseResponse(res);
}

async function uploadFormFile(
  path: string,
  fieldName: string,
  file: File,
  extraFields?: Record<string, string | number>
) {
  const fd = new FormData();
  fd.append(fieldName, file);
  if (extraFields) {
    Object.entries(extraFields).forEach(([key, value]) => {
      fd.append(key, String(value));
    });
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const failure = formatApiFailure(body, res.statusText || "Upload failed");
    throw { ...failure, status: res.status } as ApiError;
  }

  return res.json() as Promise<Record<string, unknown>>;
}

export const courseApi = {
  getAll(params: CourseListParams = {}) {
    return api
      .get<PaginatedResponse<CourseRecord> | { message?: string }>(
        `${COURSE_API_PATH}/getAll${buildQuery(params)}`
      )
      .then(normalizePaginated) as Promise<PaginatedResponse<CourseRecord>>;
  },

  getById(id: string) {
    return api
      .get<CourseRecord>(`${COURSE_API_PATH}/getById/${id}`)
      .then((row) => normalizeCmsRecord(row) as CourseRecord);
  },

  save(
    recordId: string | null,
    payload: Record<string, unknown>,
    files: CourseUploadFiles = {}
  ) {
    const hasFiles = Boolean(files.thumbnail || files.video);
    if (hasFiles) {
      if (recordId) {
        return multipartSave(
          "PATCH",
          `${COURSE_API_PATH}/update/${recordId}`,
          payload,
          files
        );
      }
      return multipartSave("POST", `${COURSE_API_PATH}/create`, payload, files);
    }

    if (recordId) {
      return api
        .patch<CourseRecord, Record<string, unknown>>(
          `${COURSE_API_PATH}/update/${recordId}`,
          payload
        )
        .then((row) => normalizeCmsRecord(row) as CourseRecord);
    }

    return api
      .post<CourseRecord, Record<string, unknown>>(
        `${COURSE_API_PATH}/create`,
        payload
      )
      .then((row) => normalizeCmsRecord(row) as CourseRecord);
  },

  uploadThumbnail(file: File) {
    return uploadFormFile(`${COURSE_API_PATH}/upload/thumbnail`, "thumbnail", file);
  },

  uploadVideo(file: File) {
    return uploadFormFile(`${COURSE_API_PATH}/upload/video`, "video", file);
  },

  uploadLessonVideo(
    courseId: string,
    moduleIndex: number,
    lessonIndex: number,
    file: File,
    lessonId?: string
  ) {
    return uploadFormFile(
      `${COURSE_API_PATH}/${courseId}/curriculum/lesson-video`,
      "video",
      file,
      { moduleIndex, lessonIndex, lessonId: lessonId ?? "" }
    );
  },

  updateStatus(id: string, status: boolean) {
    return api.patch<CourseRecord, { status: boolean }>(
      `${COURSE_API_PATH}/status/${id}`,
      { status }
    );
  },

  updateVisible(id: string, isVisible: boolean) {
    return api.patch<CourseRecord, { isVisible: boolean }>(
      `${COURSE_API_PATH}/update/${id}`,
      { isVisible }
    );
  },

  remove(id: string) {
    return api.delete<{ message?: string }>(`${COURSE_API_PATH}/delete/${id}`);
  },

  saveCurriculum(courseId: string, payload: CurriculumSavePayload) {
    const { curriculum, lessonVideoTargets, files } = payload;
    if (files.length > 0) {
      const fd = new FormData();
      fd.append("curriculum", JSON.stringify(curriculum));
      fd.append("lessonVideoTargets", JSON.stringify(lessonVideoTargets));
      files.forEach((file) => fd.append("lessonVideos", file));

      return fetch(`${API_BASE_URL}${COURSE_API_PATH}/update/${courseId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: fd,
      }).then(parseCourseResponse);
    }

    return api
      .patch<CourseRecord, { curriculum: CourseModule[] }>(
        `${COURSE_API_PATH}/update/${courseId}`,
        { curriculum }
      )
      .then((row) => normalizeCmsRecord(row) as CourseRecord);
  },

  saveResources(courseId: string, payload: ResourcesSavePayload) {
    const { resources, resourceFileIndexes, files } = payload;
    if (files.length > 0) {
      const fd = new FormData();
      fd.append("resources", JSON.stringify(resources));
      fd.append("resourceFileIndexes", JSON.stringify(resourceFileIndexes));
      files.forEach((file) => fd.append("resourceFiles", file));

      return fetch(`${API_BASE_URL}${COURSE_API_PATH}/update/${courseId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: fd,
      }).then(parseCourseResponse);
    }

    return api
      .patch<CourseRecord, { resources: CourseResource[] }>(
        `${COURSE_API_PATH}/update/${courseId}`,
        { resources }
      )
      .then((row) => normalizeCmsRecord(row) as CourseRecord);
  },
};
