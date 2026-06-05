"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export type Select2Option = { id: string; text: string };

type Select2Props = {
  options: Select2Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
};

export function Select2({
  options,
  value,
  onChange,
  placeholder = "Select…",
  error,
  disabled = false,
  allowClear = true,
  className = "",
}: Select2Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((opt) =>
    opt.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selected = options.find((opt) => opt.id === value);

  const displayLabel = selected?.text ?? (value ? value : placeholder);
  const showPlaceholderStyle = !value;

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((open) => !open)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-3.5 py-2.5 text-left text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${
          error ? "border-red-400" : "border-slate-300"
        } ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-slate-400"}`}
      >
        <span className={showPlaceholderStyle ? "text-slate-400" : "text-slate-900"}>
          {displayLabel}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {allowClear && value && !disabled && (
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
            className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-80 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt) => {
                const isSelected = value === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                      isSelected ? "bg-slate-100 font-medium text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-3 text-center text-sm text-slate-500">No results found</p>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
