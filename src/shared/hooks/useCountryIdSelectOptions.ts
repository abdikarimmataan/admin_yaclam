"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Select2Option } from "@/shared/components/Select2";
import { countryApi, type CountryRecord } from "@/shared/services/country.service";
import { resolveAssetUrl } from "@/shared/utils/asset-url";
import { toast } from "@/shared/utils/toast";
import { getErrorMessage } from "@/shared/utils/error-handler";

export function useCountryIdSelectOptions() {
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const records = await countryApi.getAll();
      setCountries(records);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load countries"));
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const options: Select2Option[] = useMemo(
    () =>
      countries
        .filter((country) => country.id)
        .map((country) => ({
          id: String(country.id),
          text: country.name,
          imageUrl: country.flag?.trim() ? resolveAssetUrl(country.flag) : undefined,
        })),
    [countries]
  );

  const nameById = useMemo(
    () => new Map(countries.map((country) => [String(country.id), country.name])),
    [countries]
  );

  return useMemo(
    () => ({ options, loading, nameById, countries }),
    [options, loading, nameById, countries]
  );
}
