"use client";

import { getStoredUser, logout } from "@/services/auth.service";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = getStoredUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-5">
      <div className="max-w-sm flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-8 pr-2.5 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="ml-3 flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          className="group relative rounded-md p-1.5 transition-colors hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-gray-600 transition-colors group-hover:text-blue-600" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="group flex items-center gap-2 rounded-md px-2 py-1 transition-all hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-sm font-bold text-white shadow-sm">
              {(user.fullname || "A").charAt(0).toUpperCase()}
            </div>
            <div className="hidden flex-col leading-tight sm:flex">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                {user.fullname || "Admin"}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-all group-hover:text-blue-600 ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 z-50 mt-1.5 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
              <div className="border-b border-gray-100 px-3.5 py-2.5">
                <p className="text-sm font-semibold text-gray-900">{user.fullname}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
