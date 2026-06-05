"use client";

import { Select2 } from "@/shared/components/Select2";
import { useCountrySelectOptions } from "@/shared/hooks/useCountrySelectOptions";

type CountrySelectFieldProps = {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (countryName: string) => void;
  error?: string;
  placeholder?: string;
  searchPlaceholder?: string;
};

export function CountrySelectField({
  label = "Country",
  required = false,
  value,
  onChange,
  error,
  placeholder = "Select a country…",
  searchPlaceholder = "Search countries…",
}: CountrySelectFieldProps) {
  const { options, loading } = useCountrySelectOptions();

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
        showImages
      />
    </div>
  );
}
