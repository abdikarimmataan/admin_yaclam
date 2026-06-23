import { isAccessTokenExpired } from "@/util/token-expiry";
import { keys } from "@/util/store.keys";

export const store = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },

  getValidAccessToken(): string | null {
    const token = this.get(keys.accessToken);
    if (!token) return null;
    if (isAccessTokenExpired(token)) {
      this.clearAuth();
      return null;
    }
    return token;
  },
  set(key: string, value: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  delete(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
  clearAuth() {
    if (typeof window === "undefined") return;
    const authKeys = [
      "yaclam_access_token",
      "yaclam_refresh_token",
      "yaclam_user_id",
      "yaclam_user_email",
      "yaclam_fullname",
      "yaclam_phone",
      "yaclam_account_type",
    ];
    authKeys.forEach((k) => localStorage.removeItem(k));
  },
};
