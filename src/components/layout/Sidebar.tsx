"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/login/service/auth.service";
import type { NavGroup, NavItem } from "@/config/navigation";
import { NAVIGATION } from "@/config/navigation";
import { ChevronDown, ChevronRight, LogOut, Menu } from "lucide-react";

function itemIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function navItemActive(pathname: string, item: NavItem): boolean {
  if (item.href && itemIsActive(pathname, item.href)) return true;
  return item.children?.some((c) => itemIsActive(pathname, c.href)) ?? false;
}

function NavItem({
  item,
  isOpen,
  pathname,
}: {
  item: NavItem;
  isOpen: boolean;
  pathname: string;
}) {
  const hasChildren = Boolean(item.children?.length);
  const active = navItemActive(pathname, item);
  const [expanded, setExpanded] = useState(active);

  useEffect(() => {
    if (active) setExpanded(true);
  }, [active]);

  if (hasChildren) {
    const Icon = item.icon;
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-all ${
            active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
          } ${!isOpen ? "justify-center" : ""}`}
          title={!isOpen ? item.label : undefined}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {isOpen && (
            <>
              <span className="flex-1 truncate text-left font-medium">{item.label}</span>
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
              )}
            </>
          )}
        </button>
        {isOpen && expanded && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
            {item.children!.map((child) => {
              const childActive = itemIsActive(pathname, child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block rounded-md px-2.5 py-1.5 text-sm transition-all ${
                    childActive
                      ? "bg-blue-50 font-medium text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const Icon = item.icon;
  const href = item.href!;
  const linkActive = itemIsActive(pathname, href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-all ${
        linkActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
      } ${!isOpen ? "justify-center" : ""}`}
      title={!isOpen ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {isOpen && <span className="truncate font-medium">{item.label}</span>}
    </Link>
  );
}

function NavGroup({
  group,
  isOpen,
  pathname,
}: {
  group: NavGroup;
  isOpen: boolean;
  pathname: string;
}) {
  return (
    <div className="mb-3">
      {isOpen && (
        <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {group.label}
        </p>
      )}
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <NavItem
            key={item.href ?? item.label}
            item={item}
            isOpen={isOpen}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
        isOpen ? "w-52" : "w-14"
      }`}
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-gray-200 px-2.5">
        {isOpen && (
          <span className="flex-1 text-center text-sm font-bold text-gray-800">
            Yaclam Admin
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-1 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5">
        {NAVIGATION.map((group) => (
          <NavGroup key={group.label} group={group} isOpen={isOpen} pathname={pathname} />
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-200 p-2.5">
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          {isOpen && <span className="font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  );
}
