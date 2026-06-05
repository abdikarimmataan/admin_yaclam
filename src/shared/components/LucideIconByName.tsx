"use client";

import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function resolveLucideIcon(name: string): LucideIcon | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const icons = LucideIcons as Record<string, LucideIcon>;
  if (icons[trimmed]) return icons[trimmed];

  const pascal = trimmed
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  if (pascal && icons[pascal]) return icons[pascal];

  return null;
}

type LucideIconByNameProps = {
  name: string;
  className?: string;
  fallbackClassName?: string;
};

export function LucideIconByName({
  name,
  className = "h-4 w-4",
  fallbackClassName,
}: LucideIconByNameProps) {
  const Icon = resolveLucideIcon(name) ?? HelpCircle;
  return <Icon className={fallbackClassName ?? className} aria-hidden />;
}

export function hasLucideIcon(name: string): boolean {
  return resolveLucideIcon(name) !== null;
}
