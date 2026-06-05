import { api } from "@/config/api";
import type { LoginPayload, LoginResponse } from "@/app/login/model/auth.model";
import { keys } from "@/util/store.keys";
import { store } from "@/util/storage";

export async function adminLogin(payload: LoginPayload) {
  const res = await api.post<LoginResponse, LoginPayload>(
    "/users/admin/login",
    payload,
    { skipAuth: true }
  );
  persistSession(res);
  return res;
}

export function persistSession(res: LoginResponse) {
  store.set(keys.accessToken, res.accessToken);
  store.set(keys.refreshToken, res.refreshToken);
  store.set(keys.userId, res.user.id);
  store.set(keys.userEmail, res.user.email);
  store.set(keys.fullname, res.user.profile?.full_name ?? "");
  store.set(keys.phone, res.user.phone ?? "");
  store.set(keys.accountType, res.user.accountType ?? "");
}

export function logout() {
  store.clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function isAuthenticated(): boolean {
  return !!store.get(keys.accessToken);
}

export function getStoredUser() {
  return {
    id: store.get(keys.userId) ?? "",
    email: store.get(keys.userEmail) ?? "",
    fullname: store.get(keys.fullname) ?? "Admin",
    phone: store.get(keys.phone) ?? "",
    accountType: store.get(keys.accountType) ?? "",
  };
}
