import { api } from "@/config/api";
import type { ApiError } from "@/config/api";
import { store } from "@/util/storage";

const SETTINGS_API_PATH = "/settings";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api";

export type SettingsLogoPicture = {
  light?: string;
  dark?: string;
  alt?: string;
  isVisible?: boolean;
};

export type SettingsRecord = {
  id?: string;
  favicon?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  logo?: {
    isVisible?: boolean;
    picture?: SettingsLogoPicture;
    text?: {
      mark?: string;
      name?: string;
      highlight?: string;
      isVisible?: boolean;
    };
  };
};

function authHeaders(): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const token = store.getValidAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function isNoData(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const message = (body as { message?: string }).message;
  return typeof message === "string" && /no data/i.test(message);
}

export async function loadSettings(): Promise<SettingsRecord | null> {
  try {
    const data = await api.get<SettingsRecord | { message?: string }>(`${SETTINGS_API_PATH}/`);
    if (isNoData(data)) return null;
    return data as SettingsRecord;
  } catch {
    return null;
  }
}

export async function uploadLogoFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("logo", file);

  const res = await fetch(`${API_BASE_URL}${SETTINGS_API_PATH}/upload/logo`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });

  if (!res.ok) {
    let message = res.statusText || "Upload failed";
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw { status: res.status, message } as ApiError;
  }

  const data = (await res.json()) as { logo?: string };
  return String(data.logo ?? "");
}

export async function saveSiteLogo(
  logoPath: string,
  recordId?: string | null,
  current?: SettingsRecord | null,
  alt = "Yaclam"
): Promise<SettingsRecord> {
  const payload = {
    logo: {
      ...(current?.logo ?? {}),
      isVisible: true,
      picture: {
        ...(current?.logo?.picture ?? {}),
        light: logoPath,
        alt: current?.logo?.picture?.alt?.trim() || alt,
        isVisible: true,
      },
    },
  };

  if (recordId) {
    return api.patch<SettingsRecord>(
      `${SETTINGS_API_PATH}/update/${recordId}`,
      payload
    );
  }

  return api.post<SettingsRecord>(`${SETTINGS_API_PATH}/create`, payload);
}

export async function uploadFaviconFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("favicon", file);

  const res = await fetch(`${API_BASE_URL}${SETTINGS_API_PATH}/upload/favicon`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });

  if (!res.ok) {
    let message = res.statusText || "Upload failed";
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw { status: res.status, message } as ApiError;
  }

  const data = (await res.json()) as { favicon?: string };
  return String(data.favicon ?? "");
}

export async function saveTabHeader(
  headerText: string,
  faviconPath: string,
  recordId?: string | null,
  current?: SettingsRecord | null
): Promise<SettingsRecord> {
  const payload = {
    favicon: faviconPath,
    seo: {
      ...(current?.seo ?? {}),
      title: headerText.trim(),
    },
  };

  if (recordId) {
    return api.patch<SettingsRecord>(
      `${SETTINGS_API_PATH}/update/${recordId}`,
      payload
    );
  }

  return api.post<SettingsRecord>(`${SETTINGS_API_PATH}/create`, payload);
}

export type SiteBrandingInput = {
  logoPath: string;
  headerText: string;
  faviconPath: string;
};

export async function saveSiteBranding(
  input: SiteBrandingInput,
  recordId?: string | null,
  current?: SettingsRecord | null,
  alt = "Yaclam"
): Promise<SettingsRecord> {
  const payload = {
    logo: {
      ...(current?.logo ?? {}),
      isVisible: true,
      picture: {
        ...(current?.logo?.picture ?? {}),
        light: input.logoPath,
        alt: current?.logo?.picture?.alt?.trim() || alt,
        isVisible: true,
      },
    },
    favicon: input.faviconPath,
    seo: {
      ...(current?.seo ?? {}),
      title: input.headerText.trim(),
    },
  };

  if (recordId) {
    return api.patch<SettingsRecord>(
      `${SETTINGS_API_PATH}/update/${recordId}`,
      payload
    );
  }

  return api.post<SettingsRecord>(`${SETTINGS_API_PATH}/create`, payload);
}
