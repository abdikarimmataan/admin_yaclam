"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { DegreeLevelModal } from "@/app/degree-level/components/DegreeLevelModal";
import { DegreeLevelTable } from "@/app/degree-level/components/DegreeLevelTable";
import {
  DEGREE_LEVEL_FORM_FIELDS,
  sortDegreeLevelsByLatestSaved,
  type DegreeLevelRecord,
} from "@/app/degree-level/model/degree-level.model";
import { degreeLevelApi } from "@/app/degree-level/service/degree-level.service";
import {
  buildDegreeLevelPayload,
  getModalFields,
  validateDegreeLevelForm,
} from "@/app/degree-level/validation/degree-level.validation";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { pickFormValues } from "@/app/frontend/CMS/lib/cms-utils";
import { confirmDelete, confirmVisibilityChange, showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

const formKeys = DEGREE_LEVEL_FORM_FIELDS.map((f) => f.key);

export function DegreeLevelpage() {
  const [items, setItems] = useState<DegreeLevelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DegreeLevelRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await degreeLevelApi.getAll({ page: 1, pageSize: 500 });
      setItems(sortDegreeLevelsByLatestSaved((res.data ?? []) as DegreeLevelRecord[]));
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load degree levels");
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
    return items.filter((item) => String(item.name ?? "").toLowerCase().includes(q));
  }, [items, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm(pickFormValues(null, formKeys));
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: DegreeLevelRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await degreeLevelApi.getById(id);
      setEditing(record);
      setForm(pickFormValues(record, formKeys));
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load degree level");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: DegreeLevelRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    if (!(await confirmDelete(String(item.name ?? "degree level")))) return;
    setBusyId(id);
    try {
      await degreeLevelApi.delete(id);
      toast.success("Deleted successfully");
      await fetchItems();
    } catch (err) {
      await showError((err as ApiError).message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Degree Level</h1>
        <p className="mt-1 text-sm text-slate-500">
          Degree level tabs on /universities (Bachelor, Master, PhD, etc.). Keep Visible on.
        </p>
      </div>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Create <Plus className="h-4 w-4" />
        </button>
      </div>
      <DegreeLevelTable
        loading={loading}
        paginated={paginated}
        startIdx={startIdx}
        search={search}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        filteredCount={filtered.length}
        busyId={busyId}
        canPrev={page > 1}
        canNext={page < totalPages}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleVisible={async (item) => {
          if (!item.id) return;
          const nextVisible = item.isVisible === false;
          if (!(await confirmVisibilityChange(String(item.name ?? "degree level"), nextVisible))) return;
          setBusyId(String(item.id));
          try {
            await degreeLevelApi.updateVisible(String(item.id), nextVisible);
            await fetchItems();
          } catch (err) {
            await showError((err as ApiError).message || "Visibility update failed");
          } finally {
            setBusyId(null);
          }
        }}
      />
      <DegreeLevelModal
        open={showModal}
        title={editing ? "Edit Degree Level" : "Create Degree Level"}
        submitLabel="Save"
        form={form}
        formErrors={formErrors}
        fields={getModalFields(Boolean(editing))}
        submitting={submitting}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
          setFormErrors({});
        }}
        onSubmit={async () => {
          const errors = validateDegreeLevelForm(form, Boolean(editing));
          if (Object.keys(errors).length) {
            setFormErrors(errors);
            toast.error("Please fix the highlighted fields");
            return;
          }
          setSubmitting(true);
          try {
            const payload = buildDegreeLevelPayload(form, Boolean(editing));
            if (editing?.id) await degreeLevelApi.update(String(editing.id), payload);
            else await degreeLevelApi.create(payload);
            toast.success(editing ? "Updated successfully" : "Created successfully");
            setShowModal(false);
            setEditing(null);
            setPage(1);
            await fetchItems();
          } catch (err) {
            toast.error((err as ApiError).message);
          } finally {
            setSubmitting(false);
          }
        }}
        onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
      />
    </div>
  );
}
