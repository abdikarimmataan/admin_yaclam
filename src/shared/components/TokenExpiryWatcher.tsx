"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getJwtExpiresAtMs } from "@/util/token-expiry";
import { store } from "@/util/storage";

function loginPathFor(path: string) {
  return path === "/instructor" || path.startsWith("/instructor/") ? "/instructor/login" : "/login";
}

function redirectExpired(path: string) {
  const loginPath = loginPathFor(path);
  if (path.startsWith(loginPath)) {
    store.clearAuth();
    return;
  }
  store.clearAuth();
  window.location.replace(`${loginPath}?redirect=${encodeURIComponent(path)}`);
}

function isProtectedPath(path: string) {
  if (path === "/login" || path.startsWith("/login/")) return false;
  if (path === "/instructor/login" || path.startsWith("/instructor/login/")) return false;
  return true;
}

export function TokenExpiryWatcher() {
  const pathname = usePathname();

  useEffect(() => {
    const token = store.getValidAccessToken();
    if (!token) return;

    const expiresAt = getJwtExpiresAtMs(token);
    if (!expiresAt) return;

    const msUntilExpiry = expiresAt - Date.now();
    if (msUntilExpiry <= 0) {
      if (isProtectedPath(pathname)) redirectExpired(pathname);
      else store.clearAuth();
      return;
    }

    const timer = setTimeout(() => {
      const path = window.location.pathname;
      if (isProtectedPath(path)) redirectExpired(path);
      else store.clearAuth();
    }, msUntilExpiry);

    const onFocus = () => {
      if (!store.getValidAccessToken() && isProtectedPath(window.location.pathname)) {
        redirectExpired(window.location.pathname);
      }
    };

    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  return null;
}
