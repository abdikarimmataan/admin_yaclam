import { api } from "@/config/api";
import type { PaginatedResponse } from "@/config/api";
import { normalizePaginated, queryString } from "@/config/pagination";
import { ROADMAP_API_PATH, type RoadmapRecord } from "@/app/roadmap/model/roadmap.model";

export const roadmapApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    return api
      .get<PaginatedResponse<RoadmapRecord> | { message?: string }>(
        `${ROADMAP_API_PATH}/getAll${queryString(params)}`
      )
      .then(normalizePaginated);
  },
  getById(id: string) {
    return api.get<RoadmapRecord>(`${ROADMAP_API_PATH}/getById/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api.post<RoadmapRecord, Record<string, unknown>>(`${ROADMAP_API_PATH}/create`, body);
  },
  update(id: string, body: Record<string, unknown>) {
    return api.patch<RoadmapRecord, Record<string, unknown>>(
      `${ROADMAP_API_PATH}/update/${id}`,
      body
    );
  },
  updateStatus(id: string, status: boolean) {
    return api.patch<RoadmapRecord, { status: boolean }>(
      `${ROADMAP_API_PATH}/status/${id}`,
      { status }
    );
  },
};
