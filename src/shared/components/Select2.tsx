"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2, X } from "lucide-react";
import { LucideIconByName } from "@/shared/components/LucideIconByName";

export type Select2Option = {
  id: string;
  text: string;
  /** Lucide icon name — shown when `showIcons` is enabled */
  icon?: string;
  /** Image URL — shown when `showImages` is enabled */
  imageUrl?: string;
};

type Select2Props = {
  options: Select2Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  showIcons?: boolean;
  showImages?: boolean;
  className?: string;
};

const DROPDOWN_MAX_HEIGHT = 280;

function optionIconName(opt: Select2Option): string {
  return opt.icon ?? opt.id;
}

function IconBadge({
  name,
  active,
}: {
  name: string;
  active: boolean;
}) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border ${
        active
          ? "border-white/40 bg-white/15 text-white"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <LucideIconByName name={name} className="h-4 w-4" />
    </span>
  );
}

function ImageBadge({
  src,
  active,
}: {
  src: string;
  active: boolean;
}) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded border ${
        active ? "border-white/40 bg-white/15" : "border-slate-200 bg-slate-50"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-5 w-5 object-contain" />
    </span>
  );
}

function OptionVisual({
  opt,
  active,
  showIcons,
  showImages,
}: {
  opt: Select2Option;
  active: boolean;
  showIcons: boolean;
  showImages: boolean;
}) {
  if (showImages && opt.imageUrl) {
    return <ImageBadge src={opt.imageUrl} active={active} />;
  }
  if (showIcons) {
    return <IconBadge name={optionIconName(opt)} active={active} />;
  }
  return null;
}

export function Select2({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  error,
  disabled = false,
  loading = false,
  allowClear = true,
  showIcons = false,
  showImages = false,
  className = "",
}: Select2Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((opt) => opt.id === value);
  const selectedVisual =
    selected ??
    (value
      ? options.find((opt) => opt.text.toLowerCase() === value.toLowerCase())
      : undefined);

  const filtered = options.filter((opt) => {
    const q = searchTerm.toLowerCase();
    return (
      opt.text.toLowerCase().includes(q) ||
      opt.id.toLowerCase().includes(q) ||
      (opt.icon ?? "").toLowerCase().includes(q)
    );
  });

  const showOptionVisual = showIcons || showImages;
  const displayLabel = selectedVisual?.text ?? (value ? value : placeholder);
  const showPlaceholderStyle = !value;
  const isDisabled = disabled || loading;

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
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
    setHighlightIndex(0);
    updateDropdownPosition();
    searchRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [searchTerm]);

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
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && filtered[highlightIndex]) {
              e.preventDefault();
              handleSelect(filtered[highlightIndex].id);
            } else if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
        />
      </div>

      <div className="max-h-60 overflow-y-auto">
        {filtered.length > 0 ? (
          filtered.map((opt, index) => {
            const isSelected = value === opt.id;
            const isHighlighted = highlightIndex === index;
            const active = isSelected || isHighlighted;

            return (
              <button
                key={opt.id}
                type="button"
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => handleSelect(opt.id)}
                className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-left text-sm ${
                  active
                    ? "bg-[#3875d7] text-white"
                    : "text-slate-800 hover:bg-[#5897fb] hover:text-white"
                }`}
              >
                {showOptionVisual && (
                  <OptionVisual
                    opt={opt}
                    active={active}
                    showIcons={showIcons}
                    showImages={showImages}
                  />
                )}
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
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {showOptionVisual && value && !loading && selectedVisual && (
            <OptionVisual
              opt={selectedVisual}
              active={false}
              showIcons={showIcons}
              showImages={showImages}
            />
          )}
          <span
            className={`truncate ${showPlaceholderStyle ? "text-slate-500" : "text-slate-900"}`}
          >
            {loading ? "Loading…" : displayLabel}
          </span>
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          {allowClear && value && !isDisabled && (
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
