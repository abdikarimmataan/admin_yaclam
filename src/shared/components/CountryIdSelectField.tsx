"use client";

import { Select2 } from "@/shared/components/Select2";
import { FormFieldLabel } from "@/shared/components/FormFieldLabel";
import { useCountryIdSelectOptions } from "@/shared/hooks/useCountryIdSelectOptions";

type CountryIdSelectFieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (countryId: string) => void;
  error?: string;
  placeholder?: string;
  searchPlaceholder?: string;
};

export function CountryIdSelectField({
  label = "Country",
  required = false,
  hint,
  value,
  onChange,
  error,
  placeholder = "Select a country…",
  searchPlaceholder = "Search countries…",
}: CountryIdSelectFieldProps) {
  const { options, loading } = useCountryIdSelectOptions();

  return (
    <div>
      <FormFieldLabel field={{ label, required, hint }} />
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
