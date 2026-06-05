"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { FieldModal } from "@/app/fields/components/FieldModal";
import { FieldTable } from "@/app/fields/components/FieldTable";
import {
  FIELD_FORM_FIELDS,
  getDuplicateSortOrders,
  getNextFieldSortOrderSuggestion,
  type FieldRecord,
} from "@/app/fields/model/field.model";
import { fieldApi } from "@/app/fields/service/field.service";
import {
  buildFieldPayload,
  getModalFields,
  validateFieldForm,
} from "@/app/fields/validation/field.validation";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { pickFormValues } from "@/app/frontend/CMS/lib/cms-utils";
import { confirmVisibilityChange, showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

const fieldKeys = FIELD_FORM_FIELDS.map((f) => f.key);

export function Fieldpage() {
  const [items, setItems] = useState<FieldRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FieldRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fieldApi.getAll({ page: 1, pageSize: 500 });
      setItems((res.data ?? []) as FieldRecord[]);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load fields");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const duplicateSortOrders = useMemo(() => getDuplicateSortOrders(items), [items]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((item) => {
      const label = String(item.name ?? "").toLowerCase();
      const description = String(item.description ?? "").toLowerCase();
      return label.includes(q) || description.includes(q);
    });
  }, [items, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const openCreate = () => {
    setEditing(null);
    const initial = pickFormValues(null, fieldKeys);
    initial.isVisible = true;
    initial.sortOrder = getNextFieldSortOrderSuggestion(items);
    setForm(initial);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: FieldRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await fieldApi.getById(id);
      setEditing(record);
      setForm(pickFormValues(record, fieldKeys));
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load field");
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
    const errors = validateFieldForm(form, Boolean(editing));
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = buildFieldPayload(form, Boolean(editing));
    setSubmitting(true);
    try {
      if (editing?.id) {
        await fieldApi.update(String(editing.id), payload);
      } else {
        await fieldApi.create(payload);
      }
      toast.success(editing ? "Updated successfully" : "Created successfully");
      closeModal();
      await fetchItems();
    } catch (err) {
      toast.error((err as ApiError).message);
      setFormErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisible = async (item: FieldRecord) => {
    if (!item.id) return;
    const nextVisible = item.isVisible === false;
    const name = String(item.name ?? "field");
    const confirmed = await confirmVisibilityChange(name, nextVisible);
    if (!confirmed) return;

    setBusyId(String(item.id));
    try {
      await fieldApi.updateStatus(String(item.id), nextVisible);
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Field List</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your fields here.</p>
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

      <FieldTable
        loading={loading}
        paginated={paginated}
        duplicateSortOrders={duplicateSortOrders}
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
        onToggleVisible={handleToggleVisible}
      />

      <FieldModal
        open={showModal}
        title={editing ? "Edit Field" : "Create"}
        submitLabel="Save"
        form={form}
        formErrors={formErrors}
        fields={getModalFields(Boolean(editing))}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
      />
    </div>
  );
}
