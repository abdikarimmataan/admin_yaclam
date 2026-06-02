import { api } from "@/api/http";
import { normalizePaginated, queryString } from "@/lib/pagination";
import type { PaginatedResponse } from "@/model/api";
import type {
  ApiUser,
  RegisterStudentPayload,
  UpdateUserPayload,
} from "@/model/user";

export type ListParams = { page?: number; pageSize?: number };

export type CreateAdminPayload = {
  email: string;
  password: string;
  phone?: string;
  roleId?: string;
  profile: { full_name: string; avatar_url?: string; bio?: string };
};

export async function getStudents(params: ListParams = {}) {
  const res = await api.get<PaginatedResponse<ApiUser> | { message?: string }>(
    `/users/getall/students${queryString(params)}`
  );
  return normalizePaginated(res);
}

export async function getAdminUsers(params: ListParams = {}) {
  const res = await api.get<PaginatedResponse<ApiUser> | { message?: string }>(
    `/users/getall/adminUsers${queryString(params)}`
  );
  return normalizePaginated(res);
}

export const createAdmin = (body: CreateAdminPayload) =>
  api.post<ApiUser, CreateAdminPayload>("/users/admin/create", body);

export async function getProfile() {
  return api.get<ApiUser>("/users/profile");
}

export async function getUserById(id: string) {
  return api.get<ApiUser>(`/users/getById/${id}`);
}

export const registerStudent = (body: RegisterStudentPayload) =>
  api.post<{ message: string }, RegisterStudentPayload>("/users/register", body);

export const updateUser = (id: string, body: UpdateUserPayload) =>
  api.patch<ApiUser, UpdateUserPayload>(`/users/admin/update/${id}`, body);

export const updateUserStatus = (id: string, status: boolean) =>
  api.patch<ApiUser, { status: boolean }>(`/users/status/${id}`, { status });

export const softDeleteUser = (id: string) =>
  api.delete<{ message: string }>(`/users/soft-delete/${id}`);
