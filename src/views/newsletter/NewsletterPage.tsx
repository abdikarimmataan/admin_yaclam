"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail } from "lucide-react";
import type { ApiError } from "@/api/http";
import { DataTable } from "@/components/common/DataTable";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getNewsletterSubscribers,
  type NewsletterSubscriber,
} from "@/services/newsletter.service";

export function NewsletterPage() {
  const [items, setItems] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getNewsletterSubscribers({ page: 1, pageSize: 500 });
      setItems(res.data ?? []);
    } catch (err) {
      setError((err as ApiError).message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter(
      (i) =>
        i.email.toLowerCase().includes(q) ||
        (i.source ?? "").toLowerCase().includes(q)
    );
  }, [items, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Newsletter</h1>
        <p className="text-sm text-gray-500">
          GET /newsletter/getAll · POST /newsletter/subscribe (public)
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable
        title="Subscribers"
        data={paginated}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search email or source..."
        page={page}
        pageSize={pageSize}
        totalRows={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        columns={[
          {
            key: "email",
            header: "Email",
            render: (i) => (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm font-medium">{i.email}</span>
              </div>
            ),
          },
          {
            key: "source",
            header: "Source",
            render: (i) => <span className="text-sm text-gray-600">{i.source || "—"}</span>,
          },
          {
            key: "date",
            header: "Subscribed",
            render: (i) => (
              <span className="text-sm text-gray-600">
                {i.subscribed_at
                  ? new Date(i.subscribed_at).toLocaleDateString()
                  : "—"}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
