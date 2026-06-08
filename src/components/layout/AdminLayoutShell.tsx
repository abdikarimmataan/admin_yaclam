"use client";

import { AuthGuard } from "@/app/login/components/AuthGuard";
import { AdminErrorBoundary } from "@/shared/components/AdminErrorBoundary";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("admin-shell-lock");
    document.body.classList.add("admin-shell-lock");
    return () => {
      document.documentElement.classList.remove("admin-shell-lock");
      document.body.classList.remove("admin-shell-lock");
    };
  }, []);

  return (
    <AuthGuard>
      <div className="flex h-dvh overflow-hidden bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4 [overflow-anchor:none] sm:p-5">
            <AdminErrorBoundary>{children}</AdminErrorBoundary>
          </main>
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
