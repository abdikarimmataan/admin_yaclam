"use client";

import { usePathname } from "next/navigation";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";

export function AdminShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login" || pathname.startsWith("/login/");

  if (isLogin) {
    return <>{children}</>;
  }

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
