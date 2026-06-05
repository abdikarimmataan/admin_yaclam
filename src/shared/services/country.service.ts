import { api } from "@/config/api";

export type CountryRecord = {
  id?: string;
  name: string;
  code?: string;
  flag?: string;
  isVisible?: boolean;
};

export const COUNTRY_API_PATH = "/country";

let cachedCountries: CountryRecord[] | null = null;
let loadPromise: Promise<CountryRecord[]> | null = null;

export const countryApi = {
  async getAll(): Promise<CountryRecord[]> {
    if (cachedCountries) return cachedCountries;
    if (!loadPromise) {
      loadPromise = api
        .get<CountryRecord[] | { message?: string }>(`${COUNTRY_API_PATH}/getAll`)
        .then((res) => {
          cachedCountries = Array.isArray(res) ? res : [];
          return cachedCountries;
        })
        .catch((err) => {
          loadPromise = null;
          throw err;
        });
    }
    return loadPromise;
  },
};
