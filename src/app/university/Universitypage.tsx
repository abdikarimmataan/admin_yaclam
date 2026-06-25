"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { UniversityModal } from "@/app/university/components/UniversityModal";
import { UniversityTable } from "@/app/university/components/UniversityTable";
import {
  UNIVERSITY_BASIC_FORM_FIELDS,
  sortUniversitiesByLatestSaved,
  toUniversityBasicFormValues,
  type UniversityRecord,
} from "@/app/university/model/university.model";
import { universityApi } from "@/app/university/service/university.service";
import {
  buildUniversityPayload,
  getModalFields,
  validateUniversityForm,
} from "@/app/university/validation/university.validation";
import { universityLocationApi } from "@/app/university-location/service/university-location.service";
import type { UniversityLocationRecord } from "@/app/university-location/model/university-location.model";
import {
  locationCountryId,
  locationsForCountry,
  locationsToSelectOptions,
} from "@/app/university/lib/university-location-helpers";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useCountryIdSelectOptions } from "@/shared/hooks/useCountryIdSelectOptions";
import { pickFormValues } from "@/app/frontend/CMS/lib/cms-utils";
import { confirmDelete, showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";
import type { Select2Option } from "@/shared/components/Select2";

const formKeys = UNIVERSITY_BASIC_FORM_FIELDS.map((f) => f.key);

export function Universitypage() {
  const [items, setItems] = useState<UniversityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [locationRecords, setLocationRecords] = useState<UniversityLocationRecord[]>([]);
  const { loading: countriesLoading } = useCountryIdSelectOptions();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UniversityRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const lookupLoading = optionsLoading || countriesLoading;

  const fetchLookups = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const locationsRes = await universityLocationApi.getAll({ page: 1, pageSize: 500 });
      setLocationRecords(
        ((locationsRes.data ?? []) as UniversityLocationRecord[]).filter((row) => row.id)
      );
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load locations");
      setLocationRecords([]);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await universityApi.getAll({ page: 1, pageSize: 500 });
      setItems(sortUniversitiesByLatestSaved((res.data ?? []) as UniversityRecord[]));
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load universities");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLookups();
    fetchItems();
  }, [fetchLookups, fetchItems]);

  const formLocationOptions = useMemo(
    () =>
      locationsToSelectOptions(
        locationsForCountry(locationRecords, String(form.countryId ?? ""))
      ),
    [locationRecords, form.countryId]
  );

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((item) => String(item.name ?? "").toLowerCase().includes(q));
  }, [items, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  const handleFormChange = (key: string, value: unknown) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "countryId") {
        const countryId = String(value ?? "").trim();
        const currentLocationId = String(current.locationId ?? "").trim();
        if (!countryId) {
          next.locationId = "";
        } else if (currentLocationId) {
          const stillValid = locationRecords.some(
            (row) =>
              String(row.id) === currentLocationId && locationCountryId(row) === countryId
          );
          if (!stillValid) next.locationId = "";
        }
      }
      return next;
    });
  };

  const openCreate = () => {
    setEditing(null);
    const initial = pickFormValues(null, formKeys);
    initial.countryId = "";
    setForm(initial);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: UniversityRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await universityApi.getById(id);
      setEditing(record);
      setForm(toUniversityBasicFormValues(record, locationRecords));
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load university");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: UniversityRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    const label = String(item.name ?? "university");
    if (!(await confirmDelete(label))) return;
    setBusyId(id);
    try {
      await universityApi.delete(id);
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Universities</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create universities with name, country, and location. Use Manage University to set category,
          year, languages, and fees.
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
      <UniversityTable
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
      <UniversityModal
        open={showModal}
        title={editing ? "Edit University" : "Create University"}
        submitLabel="Save"
        form={form}
        formErrors={formErrors}
        fields={getModalFields(Boolean(editing))}
        locationOptions={formLocationOptions}
        categoryOptions={[]}
        languageOptions={[]}
        optionsLoading={lookupLoading}
        submitting={submitting}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
          setFormErrors({});
        }}
        onSubmit={async () => {
          const errors = validateUniversityForm(form, Boolean(editing));
          if (Object.keys(errors).length) {
            setFormErrors(errors);
            toast.error("Please fix the highlighted fields");
            return;
          }
          setSubmitting(true);
          try {
            const payload = buildUniversityPayload(form, Boolean(editing));
            if (editing?.id) await universityApi.update(String(editing.id), payload);
            else await universityApi.create(payload);
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
        onChange={handleFormChange}
      />
    </div>
  );
}
