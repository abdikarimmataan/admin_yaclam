"use client";

import { InstructorAuthGuard } from "@/app/instructor/components/InstructorAuthGuard";
import { instructorLogout } from "@/app/instructor/service/instructor-auth.service";
import { keys } from "@/util/store.keys";
import { store } from "@/util/storage";
import { BookOpen, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function InstructorLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = store.get(keys.fullname) ?? "Instructor";
  const email = store.get(keys.userEmail) ?? "";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <InstructorAuthGuard>
      <div className="flex h-dvh overflow-hidden bg-gray-50">
        <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Instructor
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">Yaclam Portal</p>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            <Link
              href="/instructor/courses"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith("/instructor/courses")
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              My Courses
            </Link>
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-5">
            <p className="text-sm font-semibold text-slate-800">Course management</p>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="group flex items-center gap-2 rounded-md px-2 py-1 transition-all hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden flex-col leading-tight sm:flex">
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 z-50 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={instructorLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4 sm:p-5">
            {children}
          </main>
        </div>
      </div>
    </InstructorAuthGuard>
  );
}
