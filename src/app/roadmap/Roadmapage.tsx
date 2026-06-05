"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { RoadmapModal } from "@/app/roadmap/components/RoadmapModal";
import { RoadmapTable } from "@/app/roadmap/components/RoadmapTable";
import {
  ROADMAP_FORM_FIELDS,
  getDuplicateSortOrders,
  getNextRoadmapSortOrderSuggestion,
  sortRoadmapsByLatestSaved,
  type RoadmapRecord,
} from "@/app/roadmap/model/roadmap.model";
import { roadmapApi } from "@/app/roadmap/service/roadmap.service";
import {
  buildRoadmapPayload,
  getModalFields,
  toRoadmapFormValues,
  validateRoadmapForm,
} from "@/app/roadmap/validation/roadmap.validation";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { pickFormValues } from "@/app/frontend/CMS/lib/cms-utils";
import { confirmVisibilityChange, showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

const roadmapKeys = ROADMAP_FORM_FIELDS.map((f) => f.key);

export function Roadmapage() {
  const [items, setItems] = useState<RoadmapRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RoadmapRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roadmapApi.getAll({ page: 1, pageSize: 500 });
      setItems(sortRoadmapsByLatestSaved((res.data ?? []) as RoadmapRecord[]));
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load roadmaps");
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
      const title = String(item.title ?? "").toLowerCase();
      const description = String(item.description ?? "").toLowerCase();
      return title.includes(q) || description.includes(q);
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
    const initial = pickFormValues(null, roadmapKeys);
    initial.demand = "High";
    initial.timeToJobReady = "";
    initial["ctaButton.label"] = "";
    initial["ctaButton.url"] = "";
    initial.skills = [];
    initial.steps = [];
    initial.sortOrder = getNextRoadmapSortOrderSuggestion(items);
    setForm(initial);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: RoadmapRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await roadmapApi.getById(id);
      setEditing(record);
      setForm(toRoadmapFormValues(pickFormValues(record, roadmapKeys)));
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load roadmap");
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
    const errors = validateRoadmapForm(form, Boolean(editing));
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = buildRoadmapPayload(form, Boolean(editing));
    setSubmitting(true);
    try {
      if (editing?.id) {
        await roadmapApi.update(String(editing.id), payload);
      } else {
        await roadmapApi.create(payload);
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

  const handleToggleVisible = async (item: RoadmapRecord) => {
    if (!item.id) return;
    const nextVisible = item.isVisible === false;
    const name = String(item.title ?? "roadmap");
    const confirmed = await confirmVisibilityChange(name, nextVisible);
    if (!confirmed) return;

    setBusyId(String(item.id));
    try {
      await roadmapApi.update(String(item.id), { isVisible: nextVisible });
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Roadmap List</h1>
        <p className="mt-1 text-sm text-slate-500">Manage learning roadmaps here.</p>
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

      <RoadmapTable
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

      <RoadmapModal
        open={showModal}
        title={editing ? "Edit Roadmap" : "Create"}
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
