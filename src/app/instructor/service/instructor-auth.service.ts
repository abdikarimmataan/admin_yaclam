import { api } from "@/config/api";
import type { InstructorLoginPayload, InstructorLoginResponse } from "@/app/instructor/model/instructor-auth.model";
import { keys } from "@/util/store.keys";
import { store } from "@/util/storage";

export function persistInstructorSession(res: InstructorLoginResponse) {
  const instructor = res.instructor;
  const id = String(instructor.id ?? (instructor as { _id?: string })._id ?? "").trim();

  store.set(keys.accessToken, res.accessToken);
  store.set(keys.refreshToken, res.refreshToken);
  store.set(keys.userId, id);
  store.set(keys.userEmail, String(instructor.email ?? ""));
  store.set(keys.fullname, String(instructor.name ?? ""));
  store.set(keys.phone, String(instructor.phone ?? ""));
  store.set(keys.accountType, "instructor");
}

export async function instructorLogin(payload: InstructorLoginPayload) {
  const res = await api.post<InstructorLoginResponse, InstructorLoginPayload>(
    "/instructor/login",
    payload,
    { skipAuth: true }
  );
  persistInstructorSession(res);
  return res;
}

export function isInstructorAuthenticated(): boolean {
  return !!store.get(keys.accessToken) && store.get(keys.accountType) === "instructor";
}

export function getStoredInstructorId(): string {
  if (store.get(keys.accountType) !== "instructor") return "";
  return store.get(keys.userId) ?? "";
}

export function instructorLogout() {
  store.clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/instructor/login";
  }
}
