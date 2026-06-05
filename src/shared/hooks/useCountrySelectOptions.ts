"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Select2Option } from "@/shared/components/Select2";
import { countryApi, type CountryRecord } from "@/shared/services/country.service";
import { resolveAssetUrl } from "@/shared/utils/asset-url";
import { toast } from "@/shared/utils/toast";
import { getErrorMessage } from "@/shared/utils/error-handler";

export function useCountrySelectOptions() {
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
      countries.map((country) => ({
        id: country.name,
        text: country.name,
        imageUrl: country.flag?.trim() ? resolveAssetUrl(country.flag) : undefined,
      })),
    [countries]
  );

  const flagByName = useMemo(
    () => new Map(countries.map((country) => [country.name, country.flag?.trim() ?? ""])),
    [countries]
  );

  return useMemo(
    () => ({ options, loading, flagByName, countries }),
    [options, loading, flagByName, countries]
  );
}
