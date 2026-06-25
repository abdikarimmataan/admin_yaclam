"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { ProgramModal } from "@/app/program/components/ProgramModal";
import { ProgramTable } from "@/app/program/components/ProgramTable";
import {
  PROGRAM_FORM_FIELDS,
  sortProgramsByLatestSaved,
  type ProgramRecord,
} from "@/app/program/model/program.model";
import { programApi } from "@/app/program/service/program.service";
import { disciplineApi } from "@/app/discipline/service/discipline.service";
import type { DisciplineRecord } from "@/app/discipline/model/discipline.model";
import {
  buildProgramPayload,
  getModalFields,
  validateProgramForm,
} from "@/app/program/validation/program.validation";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { pickFormValues } from "@/app/frontend/CMS/lib/cms-utils";
import { confirmDelete, confirmVisibilityChange, showError } from "@/shared/utils/sweetalert";
import { applyFormValidationFeedback } from "@/shared/utils/form-validation";
import { toastApiError } from "@/shared/utils/api-error-toast";
import { toast } from "@/shared/utils/toast";
import { resolveRefId } from "@/app/university-language/model/university-language.model";
import type { Select2Option } from "@/shared/components/Select2";

const formKeys = PROGRAM_FORM_FIELDS.map((f) => f.key);

export function Programpage() {
  const [items, setItems] = useState<ProgramRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProgramRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [disciplineOptions, setDisciplineOptions] = useState<Select2Option[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await programApi.getAll({ page: 1, pageSize: 500 });
      setItems(sortProgramsByLatestSaved((res.data ?? []) as ProgramRecord[]));
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load programs");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const res = await disciplineApi.getAll({ page: 1, pageSize: 500 });
      setDisciplineOptions(
        ((res.data ?? []) as DisciplineRecord[])
          .filter((row) => row.id && row.isVisible !== false)
          .map((row) => ({ id: String(row.id), text: String(row.name ?? row.id) }))
      );
    } catch {
      setDisciplineOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchLookups();
  }, [fetchItems, fetchLookups]);

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
    setForm({ ...pickFormValues(null, formKeys), disciplineId: "" });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: ProgramRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await programApi.getById(id);
      setEditing(record);
      setForm({
        ...pickFormValues(record, formKeys),
        disciplineId: resolveRefId(record.disciplineId),
      });
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load program");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: ProgramRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    if (!(await confirmDelete(String(item.name ?? "program")))) return;
    setBusyId(id);
    try {
      await programApi.delete(id);
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Study Areas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Course headings for /universities (e.g. Computer Science & IT, Medicine). Keep Visible on.
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

      <ProgramTable
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
          const confirmed = await confirmVisibilityChange(String(item.name ?? "program"), nextVisible);
          if (!confirmed) return;
          setBusyId(String(item.id));
          try {
            await programApi.updateVisible(String(item.id), nextVisible);
            await fetchItems();
          } catch (err) {
            await showError((err as ApiError).message || "Visibility update failed");
          } finally {
            setBusyId(null);
          }
        }}
      />

      <ProgramModal
        open={showModal}
        title={editing ? "Edit Study Area" : "Create Study Area"}
        submitLabel="Save"
        form={form}
        formErrors={formErrors}
        fields={getModalFields(Boolean(editing))}
        disciplineOptions={disciplineOptions}
        optionsLoading={optionsLoading}
        submitting={submitting}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
          setFormErrors({});
        }}
        onSubmit={async () => {
          const errors = validateProgramForm(form, Boolean(editing));
          if (Object.keys(errors).length) {
            setFormErrors(errors);
            applyFormValidationFeedback(errors, PROGRAM_FORM_FIELDS);
            return;
          }
          setSubmitting(true);
          try {
            const payload = buildProgramPayload(form, Boolean(editing));
            if (editing?.id) {
              await programApi.update(String(editing.id), payload);
            } else {
              await programApi.create(payload);
            }
            toast.success(editing ? "Updated successfully" : "Created successfully");
            setShowModal(false);
            setEditing(null);
            setPage(1);
            await fetchItems();
          } catch (err) {
            toastApiError(err as ApiError, "Save failed");
          } finally {
            setSubmitting(false);
          }
        }}
        onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
      />
    </div>
  );
}
