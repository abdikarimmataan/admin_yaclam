import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated } from "@/config/pagination";
import {
  TESTIMONIAL_API_PATH,
  type TestimonialRecord,
} from "@/app/testimonials/model/testimonial.model";

function adminListQuery(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 500;
  return `?page=${page}&pageSize=${pageSize}&includeHidden=true`;
}

export const testimonialApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<TestimonialRecord> | { message?: string }>(
        `${TESTIMONIAL_API_PATH}/getAll${adminListQuery(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<TestimonialRecord>(`${TESTIMONIAL_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<TestimonialRecord, Record<string, unknown>>(
      `${TESTIMONIAL_API_PATH}/create`,
      body
    );
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<TestimonialRecord, Record<string, unknown>>(
      `${TESTIMONIAL_API_PATH}/update/${id}`,
      body
    );
  },
  updateVisible(id: string, isVisible: boolean) {
    return api.patch<TestimonialRecord, { isVisible: boolean }>(
      `${TESTIMONIAL_API_PATH}/status/${id}`,
      { isVisible }
    );
  },
};
