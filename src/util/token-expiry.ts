/** Decode JWT `exp` (seconds) without verifying signature — client-side expiry only. */
export function getJwtExpiresAtMs(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: number };
    if (typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string, now = Date.now()): boolean {
  const expiresAt = getJwtExpiresAtMs(token);
  if (!expiresAt) return true;
  return now >= expiresAt;
}
