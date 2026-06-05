"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { PractitionerModal } from "@/app/practitioners/components/PractitionerModal";
import { PractitionerTable } from "@/app/practitioners/components/PractitionerTable";
import {
  PRACTITIONER_FORM_FIELDS,
  getNextSortOrder,
  sortPractitionersByLatestSaved,
  type PractitionerRecord,
} from "@/app/practitioners/model/practitioner.model";
import { practitionerApi } from "@/app/practitioners/service/practitioner.service";
import {
  buildPractitionerPayload,
  getModalFields,
  validatePractitionerForm,
} from "@/app/practitioners/validation/practitioner.validation";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { pickFormValues } from "@/app/frontend/CMS/lib/cms-utils";
import { confirmVisibilityChange, showError } from "@/shared/utils/sweetalert";

const practitionerKeys = PRACTITIONER_FORM_FIELDS.map((f) => f.key);

export function Practitionerspage() {
  const [items, setItems] = useState<PractitionerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [listError, setListError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PractitionerRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await practitionerApi.getAll({ page: 1, pageSize: 500 });
      setItems(sortPractitionersByLatestSaved((res.data ?? []) as PractitionerRecord[]));
    } catch (err) {
      setListError((err as ApiError).message || "Failed to load practitioners");
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
      const role = String(item.role ?? "").toLowerCase();
      const bio = String(item.bio ?? "").toLowerCase();
      return name.includes(q) || role.includes(q) || bio.includes(q);
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
    const initial = pickFormValues(null, practitionerKeys);
    initial.color = "#1D4ED8";
    initial.coursesCount = 0;
    initial.studentsCount = "";
    initial.sortOrder = getNextSortOrder(items);
    setForm(initial);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: PractitionerRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await practitionerApi.getById(id);
      setEditing(record);
      setForm(pickFormValues(record, practitionerKeys));
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load practitioner");
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
    const errors = validatePractitionerForm(form, Boolean(editing));
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const payload = buildPractitionerPayload(form, Boolean(editing));
    setSubmitting(true);
    try {
      if (editing?.id) {
        await practitionerApi.update(String(editing.id), payload);
      } else {
        await practitionerApi.create(payload);
      }
      closeModal();
      setPage(1);
      await fetchItems();
    } catch (err) {
      setFormErrors({ _form: (err as ApiError).message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisible = async (item: PractitionerRecord) => {
    if (!item.id) return;
    const nextVisible = item.isVisible === false;
    const name = String(item.name ?? "practitioner");
    const confirmed = await confirmVisibilityChange(name, nextVisible);
    if (!confirmed) return;

    setBusyId(String(item.id));
    try {
      await practitionerApi.updateVisible(String(item.id), nextVisible);
      await fetchItems();
    } catch (err) {
      await showError((err as ApiError).message || "Visibility update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Practitioner List</h1>
        <p className="mt-1 text-sm text-slate-500">Manage home page practitioners here.</p>
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

      {listError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {listError}
        </div>
      )}

      <PractitionerTable
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
        onToggleVisible={handleToggleVisible}
      />

      <PractitionerModal
        open={showModal}
        title={editing ? "Edit Practitioner" : "Create"}
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
