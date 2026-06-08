"use client";

import { usePathname } from "next/navigation";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";

export function AdminShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login" || pathname.startsWith("/login/");
  const isInstructor = pathname.startsWith("/instructor");

  if (isLogin || isInstructor) {
    return <>{children}</>;
  }

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
