"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { ManageUniversityModal } from "@/app/manageuniversity/components/ManageUniversityModal";
import { ManageUniversityTable } from "@/app/manageuniversity/components/ManageUniversityTable";
import {
  getManageUniversityLabel,
  sortManageUniversitiesByLatestSaved,
  toManageUniversityFormValues,
  universityFromManageRecord,
  type ManageUniversityRecord,
} from "@/app/manageuniversity/model/manage-university.model";
import { manageUniversityApi } from "@/app/manageuniversity/service/manage-university.service";
import {
  buildManageUniversityPayload,
  showManageUniversityValidationToasts,
  validateManageUniversityForm,
} from "@/app/manageuniversity/validation/manage-university.validation";
import { emptyManageOffering, type UniversityRecord } from "@/app/university/model/university.model";
import { universityApi } from "@/app/university/service/university.service";
import { degreeLevelApi } from "@/app/degree-level/service/degree-level.service";
import type { DegreeLevelRecord } from "@/app/degree-level/model/degree-level.model";
import { programApi } from "@/app/program/service/program.service";
import type { ProgramRecord } from "@/app/program/model/program.model";
import { disciplineApi } from "@/app/discipline/service/discipline.service";
import type { DisciplineRecord } from "@/app/discipline/model/discipline.model";
import { universityLanguageApi } from "@/app/university-language/service/university-language.service";
import type { UniversityLanguageRecord } from "@/app/university-language/model/university-language.model";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { confirmDeleteManageRecord, showError } from "@/shared/utils/sweetalert";
import { toastApiError } from "@/shared/utils/api-error-toast";
import { toast } from "@/shared/utils/toast";
import type { Select2Option } from "@/shared/components/Select2";
import { resolveRefId } from "@/app/university-language/model/university-language.model";

const emptyForm = {
  manageId: "",
  universityId: "",
  offerings: [emptyManageOffering()],
};

export function ManageUniversitypage() {
  const [items, setItems] = useState<ManageUniversityRecord[]>([]);
  const [allUniversities, setAllUniversities] = useState<UniversityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [degreeLevelOptions, setDegreeLevelOptions] = useState<Select2Option[]>([]);
  const [studyAreaOptions, setStudyAreaOptions] = useState<Select2Option[]>([]);
  const [disciplineOptions, setDisciplineOptions] = useState<Select2Option[]>([]);
  const [languageOptions, setLanguageOptions] = useState<Select2Option[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ManageUniversityRecord | null>(null);
  const [previewUniversity, setPreviewUniversity] = useState<UniversityRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const managedUniversityIds = useMemo(
    () =>
      new Set(
        items
          .map((row) => {
            const university = universityFromManageRecord(row);
            return university ? resolveRefId(university.id) : resolveRefId(row.universityId);
          })
          .filter(Boolean)
      ),
    [items]
  );

  const universityOptions = useMemo(() => {
    const editingUniversityId = editing
      ? resolveRefId(
          universityFromManageRecord(editing)?.id ?? editing.universityId
        )
      : "";

    return allUniversities
      .filter((row) => row.id)
      .filter((row) => {
        const id = String(row.id);
        if (editingUniversityId && id === editingUniversityId) return true;
        return !managedUniversityIds.has(id);
      })
      .map((row) => ({
        id: String(row.id),
        text: String(row.name ?? row.id),
      }));
  }, [allUniversities, managedUniversityIds, editing]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await manageUniversityApi.getAll({ page: 1, pageSize: 500 });
      setItems(sortManageUniversitiesByLatestSaved((res.data ?? []) as ManageUniversityRecord[]));
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load manage records");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUniversities = useCallback(async () => {
    try {
      const res = await universityApi.getAll({ page: 1, pageSize: 500 });
      setAllUniversities((res.data ?? []) as UniversityRecord[]);
    } catch {
      setAllUniversities([]);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [degreeLevelsRes, studyAreasRes, disciplinesRes, languagesRes] = await Promise.all([
        degreeLevelApi.getAll({ page: 1, pageSize: 500 }),
        programApi.getAll({ page: 1, pageSize: 500 }),
        disciplineApi.getAll({ page: 1, pageSize: 500 }),
        universityLanguageApi.getAll({ page: 1, pageSize: 500 }),
      ]);

      setDegreeLevelOptions(
        ((degreeLevelsRes.data ?? []) as DegreeLevelRecord[])
          .filter((row) => row.id && row.isVisible !== false)
          .map((row) => ({
            id: String(row.id),
            text: String(row.name ?? row.id),
          }))
      );

      setStudyAreaOptions(
        ((studyAreasRes.data ?? []) as ProgramRecord[])
          .filter((row) => row.id && row.isVisible !== false)
          .map((row) => ({
            id: String(row.id),
            text: String(row.name ?? row.id),
          }))
      );

      setDisciplineOptions(
        ((disciplinesRes.data ?? []) as DisciplineRecord[])
          .filter((row) => row.id && row.isVisible !== false)
          .map((row) => ({
            id: String(row.id),
            text: String(row.name ?? row.id),
          }))
      );

      setLanguageOptions(
        ((languagesRes.data ?? []) as UniversityLanguageRecord[])
          .filter((row) => row.id)
          .map((row) => ({
            id: String(row.id),
            text: String(row.name ?? row.id),
          }))
      );
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load lookup data");
      setDegreeLevelOptions([]);
      setStudyAreaOptions([]);
      setDisciplineOptions([]);
      setLanguageOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchUniversities();
    fetchLookups();
  }, [fetchItems, fetchUniversities, fetchLookups]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((item) =>
      getManageUniversityLabel(item).toLowerCase().includes(q)
    );
  }, [items, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  const openCreate = () => {
    setEditing(null);
    setPreviewUniversity(null);
    setForm({ ...emptyForm, offerings: [emptyManageOffering()] });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: ManageUniversityRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await manageUniversityApi.getById(id);
      setEditing(record);
      setPreviewUniversity(universityFromManageRecord(record));
      setForm(toManageUniversityFormValues(record));
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load manage record");
    } finally {
      setBusyId(null);
    }
  };

  const handleChange = (key: string, value: unknown) => {
    if (key === "universityId") {
      const universityId = String(value ?? "").trim();
      setForm((current) => ({ ...current, universityId }));
      const university = allUniversities.find((row) => String(row.id) === universityId) ?? null;
      setPreviewUniversity(university);
      return;
    }
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleDelete = async (item: ManageUniversityRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    const label = getManageUniversityLabel(item);
    if (!(await confirmDeleteManageRecord(label))) return;
    setBusyId(id);
    try {
      await manageUniversityApi.delete(id);
      toast.success("Manage record deleted successfully");
      await Promise.all([fetchItems(), fetchUniversities()]);
    } catch (err) {
      toastApiError(err as ApiError, "Failed to delete manage record");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage University</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add offerings for universities created on the Universities page. Deleting here only removes
          this manage record — not the university itself.
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

      <ManageUniversityTable
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
      />

      <ManageUniversityModal
        open={showModal}
        title={editing ? "Edit Manage University" : "Create Manage University"}
        submitLabel={editing ? "Save" : "Create"}
        form={form}
        formErrors={formErrors}
        editing={Boolean(editing)}
        previewUniversity={previewUniversity}
        universityOptions={universityOptions}
        studyAreaOptions={studyAreaOptions}
        disciplineOptions={disciplineOptions}
        degreeLevelOptions={degreeLevelOptions}
        languageOptions={languageOptions}
        optionsLoading={optionsLoading}
        submitting={submitting}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
          setPreviewUniversity(null);
          setFormErrors({});
        }}
        onSubmit={async () => {
          const errors = validateManageUniversityForm(form, Boolean(editing));
          if (Object.keys(errors).length) {
            setFormErrors(errors);
            showManageUniversityValidationToasts(errors);
            return;
          }

          setSubmitting(true);
          try {
            const payload = buildManageUniversityPayload(form);
            if (editing?.id) {
              await manageUniversityApi.update(String(editing.id), payload);
              toast.success("Updated successfully");
            } else {
              await manageUniversityApi.create(payload);
              toast.success("Manage record created successfully");
            }
            setShowModal(false);
            setEditing(null);
            setPreviewUniversity(null);
            setPage(1);
            await Promise.all([fetchItems(), fetchUniversities()]);
          } catch (err) {
            toastApiError(err as ApiError, "Save failed");
          } finally {
            setSubmitting(false);
          }
        }}
        onChange={handleChange}
      />
    </div>
  );
}
