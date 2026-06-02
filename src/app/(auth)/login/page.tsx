"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";
import { isAuthenticated } from "@/services/auth.service";
import { LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isAuthenticated()) {
      window.location.replace("/dashboard");
      return;
    }

    setShowForm(true);
  }, [mounted]);

  if (!mounted || !showForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white sm:flex lg:p-10">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/20 p-2">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold">Yaclam Admin</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold leading-tight lg:text-3xl">
            Manage your platform
          </h2>
          <p className="mt-2 max-w-md text-sm text-blue-100 lg:text-base">
            Sign in with your admin account to access the dashboard, users, and
            content management tools.
          </p>
        </div>
        <p className="text-xs text-blue-200">© {new Date().getFullYear()} Yaclam</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md sm:hidden">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter your credentials to continue
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <Suspense
              fallback={
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">Admin access only</p>
        </div>
      </div>
    </div>
  );
}
