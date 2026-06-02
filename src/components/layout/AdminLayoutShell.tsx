"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminErrorBoundary } from "@/components/common/AdminErrorBoundary";
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

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-4 sm:p-5">
            <AdminErrorBoundary>{children}</AdminErrorBoundary>
          </main>
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
