export type StatItem = {
  value: string;
  label: string;
  isVisible: boolean;
};

export function emptyStatItem(): StatItem {
  return { value: "", label: "", isVisible: true };
}

export function normalizeStatsItems(value: unknown): StatItem[] {
  if (Array.isArray(value)) {
    return value.map((row) => {
      const r = row as { value?: string; label?: string; isVisible?: boolean };
      return {
        value: String(r.value ?? ""),
        label: String(r.label ?? ""),
        isVisible: r.isVisible !== false,
      };
    });
  }

  if (typeof value !== "string" || !value.trim()) return [];

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [val = "", label = "", visible = "true"] = line.split("|");
      const v = visible.trim().toLowerCase();
      return {
        value: val.trim(),
        label: label.trim(),
        isVisible: !["false", "0", "no", "off"].includes(v),
      };
    });
}

export function statsItemsToPayload(items: StatItem[]): StatItem[] {
  return items
    .map((item) => ({
      value: item.value.trim(),
      label: item.label.trim(),
      isVisible: item.isVisible,
    }))
    .filter((item) => item.value || item.label);
}
