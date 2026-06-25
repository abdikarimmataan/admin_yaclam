"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { UniversityLanguageModal } from "@/app/university-language/components/UniversityLanguageModal";
import { UniversityLanguageTable } from "@/app/university-language/components/UniversityLanguageTable";
import {
  UNIVERSITY_LANGUAGE_FORM_FIELDS,
  resolveRefId,
  sortUniversityLanguagesByLatestSaved,
  countryLabelFromLanguage,
  type UniversityLanguageRecord,
} from "@/app/university-language/model/university-language.model";
import { universityLanguageApi } from "@/app/university-language/service/university-language.service";
import {
  buildUniversityLanguagePayload,
  getModalFields,
  validateUniversityLanguageForm,
} from "@/app/university-language/validation/university-language.validation";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { pickFormValues } from "@/app/frontend/CMS/lib/cms-utils";
import { confirmDelete, confirmVisibilityChange, showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

const formKeys = UNIVERSITY_LANGUAGE_FORM_FIELDS.map((f) => f.key);

export function UniversityLanguagepage() {
  const [items, setItems] = useState<UniversityLanguageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UniversityLanguageRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await universityLanguageApi.getAll({ page: 1, pageSize: 500 });
      setItems(sortUniversityLanguagesByLatestSaved((res.data ?? []) as UniversityLanguageRecord[]));
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load languages");
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
      const name = String(item.name ?? "").toLowerCase();
      const country = countryLabelFromLanguage(item).toLowerCase();
      return name.includes(q) || country.includes(q);
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
    setForm(pickFormValues(null, formKeys));
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: UniversityLanguageRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await universityLanguageApi.getById(id);
      setEditing(record);
      setForm({
        ...pickFormValues(record, formKeys),
        countryId: resolveRefId(record.countryId),
      });
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load language");
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
    const errors = validateUniversityLanguageForm(form, Boolean(editing));
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = buildUniversityLanguagePayload(form, Boolean(editing));
    setSubmitting(true);
    try {
      if (editing?.id) {
        await universityLanguageApi.update(String(editing.id), payload);
      } else {
        await universityLanguageApi.create(payload);
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

  const handleToggleVisible = async (item: UniversityLanguageRecord) => {
    if (!item.id) return;
    const nextVisible = item.isVisible === false;
    const name = String(item.name ?? "language");
    const confirmed = await confirmVisibilityChange(name, nextVisible);
    if (!confirmed) return;

    setBusyId(String(item.id));
    try {
      await universityLanguageApi.updateVisible(String(item.id), nextVisible);
      await fetchItems();
    } catch (err) {
      await showError((err as ApiError).message || "Visibility update failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: UniversityLanguageRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    if (!(await confirmDelete(String(item.name ?? "language")))) return;
    setBusyId(id);
    try {
      await universityLanguageApi.delete(id);
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">University Languages</h1>
        <p className="mt-1 text-sm text-slate-500">
          Languages of instruction. Assign them when editing a university so they appear on the website.
        </p>
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

      <UniversityLanguageTable
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
        onDelete={handleDelete}
        onToggleVisible={handleToggleVisible}
      />

      <UniversityLanguageModal
        open={showModal}
        title={editing ? "Edit Language" : "Create Language"}
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
