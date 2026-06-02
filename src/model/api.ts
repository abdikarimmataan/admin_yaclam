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
