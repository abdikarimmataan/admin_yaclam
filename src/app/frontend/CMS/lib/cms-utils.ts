import type { CmsRecord } from "@/config/api";

export function getRecordLabel(item: CmsRecord): string {
  const title = item.title as string | undefined;
  const name = item.name as string | undefined;
  const slug = item.slug as string | undefined;
  const email = item.email as string | undefined;
  const hero = item.heroTitle as string | undefined;
  return title || name || slug || email || hero || String(item.id ?? "—");
}

export function pickFormValues(
  item: object | null,
  keys: string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  keys.forEach((key) => {
    const val = item ? getValueByPath(item as Record<string, unknown>, key) : undefined;
    if (val !== undefined && val !== null) out[key] = val;
    else if (
      key === "status" ||
      key === "isVisible" ||
      key.endsWith(".isVisible") ||
      key === "isPublished" ||
      key === "isFree" ||
      key === "isFeatured"
    )
      out[key] = true;
    else if (typeof val === "number") out[key] = 0;
    else out[key] = "";
  });
  return out;
}

export function getValueByPath(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function setValueByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const keys = path.split(".");
  const last = keys.pop();
  if (!last) return;
  let cursor: Record<string, unknown> = obj;
  for (const key of keys) {
    if (!cursor[key] || typeof cursor[key] !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[last] = value;
}
