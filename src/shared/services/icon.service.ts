import { api } from "@/config/api";

export type IconRecord = {
  id?: string;
  name: string;
  label?: string;
  isVisible?: boolean;
};

export const ICONS_API_PATH = "/icons";

let cachedIcons: IconRecord[] | null = null;
let loadPromise: Promise<IconRecord[]> | null = null;

export const iconApi = {
  async getAll(): Promise<IconRecord[]> {
    if (cachedIcons) return cachedIcons;
    if (!loadPromise) {
      loadPromise = api
        .get<IconRecord[] | { message?: string }>(`${ICONS_API_PATH}/getAll`)
        .then((res) => {
          cachedIcons = Array.isArray(res) ? res : [];
          return cachedIcons;
        })
        .catch((err) => {
          loadPromise = null;
          throw err;
        });
    }
    return loadPromise;
  },
};
