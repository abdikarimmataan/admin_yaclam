import { keys } from "@/util/store.keys";
import { store } from "@/util/storage";
import type { ValidationError } from "@/app/login/model/auth.model";

export type ApiError = {
  status: number;
  message: string;
  errors?: ValidationError[];
};

export type PaginatedResponse<T> = {
  page: number;
  pages: number;
  pageSize: number;
  rows: number;
  data: T[];
};

export type CmsRecord = Record<string, unknown> & {
  id?: string;
  title?: string;
  name?: string;
  slug?: string;
  email?: string;
  status?: boolean;
  isVisible?: boolean;
  isPublished?: boolean;
  created_at?: string;
};

type RequestOpts = RequestInit & {
  suppressToast?: boolean;
  skipAuth?: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api";

function getAuthToken(): string | null {
  return store.get(keys.accessToken);
}

function extractMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const b = body as Record<string, unknown>;
  if (typeof b.message === "string" && b.message.trim()) return b.message;
  if (Array.isArray(b.errors) && b.errors[0]?.message) {
    return String((b.errors[0] as ValidationError).message);
  }
  return fallback;
}

function extractValidationErrors(body: unknown): ValidationError[] | undefined {
  if (!body || typeof body !== "object") return undefined;
  const errors = (body as { errors?: ValidationError[] }).errors;
  return Array.isArray(errors) ? errors : undefined;
}

async function request<T>(endpoint: string, options?: RequestOpts): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options?.headers);

  if (!options?.skipAuth && !headers.has("Authorization")) {
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = undefined;
      }

      const err: ApiError = {
        status: res.status,
        message: extractMessage(body, res.statusText || "Request failed"),
        errors: extractValidationErrors(body),
      };

      if (
        res.status === 401 &&
        typeof window !== "undefined" &&
        options?.method &&
        options.method !== "GET"
      ) {
        store.clearAuth();
        const path = window.location.pathname;
        if (!path.startsWith("/login")) {
          window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        }
      }

      throw err;
    }

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  } catch (e) {
    if (e && typeof e === "object" && "status" in e) throw e;
    throw {
      status: 0,
      message: e instanceof Error ? e.message : "Network error",
    } as ApiError;
  }
}

function withBody<Payload>(
  method: string,
  body?: Payload,
  init?: RequestOpts
): RequestOpts {
  return {
    method,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  };
}

export const api = {
  get<T>(endpoint: string, init?: RequestOpts) {
    return request<T>(endpoint, { ...init, method: "GET" });
  },
  post<T, Payload = unknown>(endpoint: string, body?: Payload, init?: RequestOpts) {
    return request<T>(endpoint, withBody("POST", body, init));
  },
  put<T, Payload = unknown>(endpoint: string, body?: Payload, init?: RequestOpts) {
    return request<T>(endpoint, withBody("PUT", body, init));
  },
  patch<T, Payload = unknown>(endpoint: string, body?: Payload, init?: RequestOpts) {
    return request<T>(endpoint, withBody("PATCH", body, init));
  },
  delete<T>(endpoint: string, init?: RequestOpts) {
    return request<T>(endpoint, { ...init, method: "DELETE" });
  },
};
