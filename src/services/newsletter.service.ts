import { api } from "@/api/http";
import type { PaginatedResponse } from "@/model/api";
import { normalizePaginated, queryString } from "@/lib/pagination";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  source?: string;
  isActive?: boolean;
  subscribed_at?: string;
};

export async function getNewsletterSubscribers(
  params: { page?: number; pageSize?: number } = {}
) {
  const res = await api.get<PaginatedResponse<NewsletterSubscriber> | { message?: string }>(
    `/newsletter/getAll${queryString(params)}`
  );
  return normalizePaginated(res);
}

export const subscribeNewsletter = (body: { email: string; source?: string }) =>
  api.post<NewsletterSubscriber, { email: string; source?: string }>(
    "/newsletter/subscribe",
    body,
    { skipAuth: true }
  );
