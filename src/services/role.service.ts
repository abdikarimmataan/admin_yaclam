import { api } from "@/api/http";
import type { PaginatedResponse } from "@/model/api";
import { normalizePaginated, queryString } from "@/lib/pagination";

export type Role = {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  isVisible?: boolean;
  created_at?: string;
};

export type RolePayload = {
  name: string;
  description?: string;
  permissions?: string[];
  isVisible?: boolean;
};

export async function getRoles(params: { page?: number; pageSize?: number } = {}) {
  const res = await api.get<PaginatedResponse<Role> | { message?: string }>(
    `/role/getAll${queryString(params)}`
  );
  return normalizePaginated(res);
}

export const createRole = (body: RolePayload) =>
  api.post<Role, RolePayload>("/role/create", body);

export const updateRole = (id: string, body: Partial<RolePayload>) =>
  api.patch<Role, Partial<RolePayload>>(`/role/update/${id}`, body);

export const deleteRole = (id: string) =>
  api.delete<{ message?: string }>(`/role/delete/${id}`);
