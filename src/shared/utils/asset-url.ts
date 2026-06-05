export function resolveAssetUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/** True when the value looks like an image URL/path (not a plain emoji). */
export function isImageAsset(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  return trimmed.startsWith("/");
}
