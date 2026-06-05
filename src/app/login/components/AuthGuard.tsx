"use client";

import { isAuthenticated } from "@/app/login/service/auth.service";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-2">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isClient = useIsClient();
  const authed = isClient && isAuthenticated();

  useEffect(() => {
    if (!isClient || authed) return;
    const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
    window.location.replace(loginUrl);
  }, [isClient, authed, pathname]);

  if (!isClient) {
    return <LoadingScreen message="Loading…" />;
  }

  if (!authed) {
    return <LoadingScreen message="Redirecting to login…" />;
  }

  return <>{children}</>;
}
