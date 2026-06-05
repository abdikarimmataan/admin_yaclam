"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Select2Option } from "@/shared/components/Select2";
import { iconApi } from "@/shared/services/icon.service";
import { toast } from "@/shared/utils/toast";
import { getErrorMessage } from "@/shared/utils/error-handler";

export function useIconSelectOptions() {
  const [icons, setIcons] = useState<Select2Option[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const records = await iconApi.getAll();
      setIcons(
        records.map((icon) => ({
          id: icon.name,
          text: icon.label?.trim() ? icon.label : icon.name,
          icon: icon.name,
        }))
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load icons"));
      setIcons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(() => ({ options: icons, loading }), [icons, loading]);
}
