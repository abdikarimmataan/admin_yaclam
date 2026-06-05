import type { ApiError } from "@/config/api";

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as ApiError).message || fallback);
  }
  return fallback;
}

export type { ApiError };
