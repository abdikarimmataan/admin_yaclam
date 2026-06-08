"use client";

import { InstructorLayoutShell } from "@/app/instructor/components/InstructorLayoutShell";
import { usePathname } from "next/navigation";

export default function InstructorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/instructor/login" || pathname.startsWith("/instructor/login/");

  if (isLogin) {
    return <>{children}</>;
  }

  return <InstructorLayoutShell>{children}</InstructorLayoutShell>;
}
