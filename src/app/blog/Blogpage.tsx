"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { blogCategoryApi } from "@/app/blog-category/service/blog-category.service";
import type { BlogCategoryRecord } from "@/app/blog-category/model/blog-category.model";
import { getBlogCategoryLabel } from "@/app/blog-category/model/blog-category.model";
import { BlogModal } from "@/app/blog/components/BlogModal";
import { BlogTable } from "@/app/blog/components/BlogTable";
import {
  BLOG_FORM_FIELDS,
  sortBlogPostsByLatestSaved,
  type BlogPostRecord,
} from "@/app/blog/model/blog.model";
import { blogPostApi } from "@/app/blog/service/blog.service";
import {
  buildBlogPayload,
  getModalFields,
  toBlogFormValues,
  validateBlogForm,
} from "@/app/blog/validation/blog.validation";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { pickFormValues } from "@/app/frontend/CMS/lib/cms-utils";
import { showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";
import type { Select2Option } from "@/shared/components/Select2";

const blogKeys = BLOG_FORM_FIELDS.map((f) => f.key);

function getCategoryRecordId(item: BlogCategoryRecord): string {
  return String(item.id ?? "").trim();
}

export function Blogpage() {
  const [items, setItems] = useState<BlogPostRecord[]>([]);
  const [categories, setCategories] = useState<BlogCategoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogPostRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const categoryOptions: Select2Option[] = useMemo(
    () =>
      categories
        .map((c) => ({
          id: getCategoryRecordId(c),
          text: getBlogCategoryLabel(c),
        }))
        .filter((c) => c.id),
    [categories]
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        blogPostApi.getAll({ page: 1, pageSize: 500 }),
        blogCategoryApi.getAll({ page: 1, pageSize: 500 }),
      ]);
      setItems(sortBlogPostsByLatestSaved((postsRes.data ?? []) as BlogPostRecord[]));
      setCategories((categoriesRes.data ?? []) as BlogCategoryRecord[]);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load blog posts");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((item) => {
      const title = String(item.title ?? "").toLowerCase();
      const excerpt = String(item.excerpt ?? "").toLowerCase();
      const category = String(item.category ?? "").toLowerCase();
      return title.includes(q) || excerpt.includes(q) || category.includes(q);
    });
  }, [items, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const openCreate = () => {
    if (categories.length === 0) {
      toast.error("Create at least one blog category before adding posts.");
      return;
    }
    setEditing(null);
    const initial = pickFormValues(null, blogKeys);
    initial.readTime = 0;
    initial.categoryId = getCategoryRecordId(categories[0]);
    setForm(initial);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: BlogPostRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await blogPostApi.getById(id);
      setEditing(record);
      setForm(toBlogFormValues(pickFormValues(record, blogKeys)));
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load blog post");
    } finally {
      setBusyId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    const errors = validateBlogForm(form, Boolean(editing));
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = buildBlogPayload(form, Boolean(editing));
    setSubmitting(true);
    try {
      if (editing?.id) {
        await blogPostApi.update(String(editing.id), payload);
      } else {
        await blogPostApi.create(payload);
      }
      toast.success(editing ? "Updated successfully" : "Created successfully");
      closeModal();
      setPage(1);
      await fetchItems();
    } catch (err) {
      toast.error((err as ApiError).message);
      setFormErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublished = async (item: BlogPostRecord) => {
    if (!item.id) return;
    const nextStatus = item.status === "published" ? "draft" : "published";
    const title = String(item.title ?? "post");
    const result = await Swal.fire({
      title: nextStatus === "published" ? "Publish post?" : "Move to draft?",
      text:
        nextStatus === "published"
          ? `Publish "${title}" on the website?`
          : `Move "${title}" back to draft?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, continue",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    setBusyId(String(item.id));
    try {
      await blogPostApi.updateStatus(String(item.id), nextStatus);
      await fetchItems();
    } catch (err) {
      await showError((err as ApiError).message || "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Blog List</h1>
        <p className="mt-1 text-sm text-slate-500">Manage blog posts here.</p>
      </div>

      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Create
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <BlogTable
        loading={loading}
        paginated={paginated}
        startIdx={startIdx}
        search={search}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        filteredCount={filtered.length}
        busyId={busyId}
        canPrev={canPrev}
        canNext={canNext}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onEdit={openEdit}
        onTogglePublished={handleTogglePublished}
      />

      <BlogModal
        open={showModal}
        title={editing ? "Edit Blog Post" : "Create"}
        submitLabel="Save"
        form={form}
        formErrors={formErrors}
        fields={getModalFields(Boolean(editing))}
        categoryOptions={categoryOptions}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
      />
    </div>
  );
}
