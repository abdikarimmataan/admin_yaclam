"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import type { Select2Option } from "@/shared/components/Select2";

type MultiSelect2Props = {
  options: Select2Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const DROPDOWN_MAX_HEIGHT = 280;

export function MultiSelect2({
  options,
  values,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  error,
  disabled = false,
  loading = false,
  className = "",
}: MultiSelect2Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.filter((opt) => values.includes(opt.id));
  const filtered = options.filter((opt) => {
    const q = searchTerm.toLowerCase();
    return opt.text.toLowerCase().includes(q) || opt.id.toLowerCase().includes(q);
  });

  const isDisabled = disabled || loading;

  const toggleValue = (optionId: string) => {
    if (values.includes(optionId)) {
      onChange(values.filter((id) => id !== optionId));
    } else {
      onChange([...values, optionId]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const updateDropdownPosition = () => {
    const trigger = containerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUpward =
      spaceBelow < DROPDOWN_MAX_HEIGHT + 8 && spaceAbove > spaceBelow;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      ...(shouldOpenUpward
        ? { bottom: window.innerHeight - rect.top + 2 }
        : { top: rect.bottom + 2 }),
      zIndex: 9999,
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
      setSearchTerm("");
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      return;
    }
    updateDropdownPosition();
    searchRef.current?.focus();
  }, [isOpen]);

  const displayLabel =
    selected.length > 0
      ? selected.map((opt) => opt.text).join(", ")
      : placeholder;

  const dropdown = (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="overflow-hidden rounded border border-slate-300 bg-white shadow-lg"
    >
      <div className="border-b border-slate-200 bg-white p-1">
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full border border-slate-300 px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="max-h-60 overflow-y-auto">
        {filtered.length > 0 ? (
          filtered.map((opt) => {
            const isSelected = values.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleValue(opt.id)}
                className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-left text-sm ${
                  isSelected
                    ? "bg-[#3875d7] text-white"
                    : "text-slate-800 hover:bg-[#5897fb] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isSelected ? "border-white bg-white/20" : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate">{opt.text}</span>
              </button>
            );
          })
        ) : (
          <p className="px-3 py-2 text-sm text-slate-500">No results found</p>
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen((open) => !open)}
        disabled={isDisabled}
        className={`flex w-full items-center justify-between gap-2 rounded border bg-white px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
          error ? "border-red-400" : "border-slate-300"
        } ${isDisabled ? "cursor-not-allowed opacity-60" : "hover:border-slate-400"}`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            selected.length > 0 ? "text-slate-900" : "text-slate-500"
          }`}
        >
          {loading ? "Loading…" : displayLabel}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          {values.length > 0 && !isDisabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="inline-flex rounded p-0.5 transition-colors hover:bg-slate-100"
              title="Clear"
            >
              <X className="h-3.5 w-3.5 text-slate-500" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {mounted && isOpen && createPortal(dropdown, document.body)}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
