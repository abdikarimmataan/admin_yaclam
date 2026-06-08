"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { InstructorRoleModal } from "@/app/instructor-roles/components/InstructorRoleModal";
import { InstructorRoleTable } from "@/app/instructor-roles/components/InstructorRoleTable";
import { INSTRUCTOR_ROLE_FORM_FIELDS } from "@/app/instructor-roles/model/instructor-role.model";
import type { InstructorRoleRecord } from "@/app/instructor-roles/model/instructor-role.model";
import { instructorRoleApi } from "@/app/instructor-roles/service/instructor-role.service";
import {
  buildInstructorRolePayload,
  getModalFields,
  validateInstructorRoleForm,
} from "@/app/instructor-roles/validation/instructor-role.validation";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { pickFormValues } from "@/app/frontend/CMS/lib/cms-utils";
import { showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

const roleKeys = INSTRUCTOR_ROLE_FORM_FIELDS.map((f) => f.key);

export function InstructorRolepage() {
  const [items, setItems] = useState<InstructorRoleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InstructorRoleRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await instructorRoleApi.getAll({ page: 1, pageSize: 500 });
      setItems((res.data ?? []) as InstructorRoleRecord[]);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load instructor roles");
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
      const description = String(item.description ?? "").toLowerCase();
      return name.includes(q) || description.includes(q);
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
    setForm(pickFormValues(null, roleKeys));
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = async (item: InstructorRoleRecord) => {
    const id = String(item.id ?? "");
    if (!id) return;
    setBusyId(id);
    try {
      const record = await instructorRoleApi.getById(id);
      setEditing(record);
      setForm(pickFormValues(record, roleKeys));
      setFormErrors({});
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load role");
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
    const errors = validateInstructorRoleForm(form, Boolean(editing));
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = buildInstructorRolePayload(form);
    setSubmitting(true);
    try {
      if (editing?.id) {
        await instructorRoleApi.update(String(editing.id), payload);
      } else {
        await instructorRoleApi.create(payload);
      }
      toast.success(editing ? "Role updated." : "Role created.");
      closeModal();
      await fetchItems();
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Instructor Roles</h1>
        <p className="mt-1 text-sm text-slate-500">Manage instructor role types.</p>
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

      <InstructorRoleTable
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
      />

      <InstructorRoleModal
        open={showModal}
        title={editing ? "Edit Role" : "Create Role"}
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
