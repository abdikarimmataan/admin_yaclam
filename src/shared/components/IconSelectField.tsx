"use client";

import { Select2 } from "@/shared/components/Select2";
import { useIconSelectOptions } from "@/shared/hooks/useIconSelectOptions";

type IconSelectFieldProps = {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  searchPlaceholder?: string;
};

export function IconSelectField({
  label = "Icon",
  required = false,
  value,
  onChange,
  error,
  placeholder = "Select an icon…",
  searchPlaceholder = "Search icons…",
}: IconSelectFieldProps) {
  const { options, loading } = useIconSelectOptions();

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <Select2
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        error={error}
        loading={loading}
        showIcons
      />
    </div>
  );
}
