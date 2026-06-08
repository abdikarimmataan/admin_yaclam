"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { InstructorModal } from "@/app/instructors/components/InstructorModal";
import { InstructorTable } from "@/app/instructors/components/InstructorTable";
import type { InstructorRecord } from "@/app/instructors/model/instructor.model";
import {
  getInstructorLabel,
  getInstructorRecordId,
} from "@/app/instructors/model/instructor.model";
import { instructorApi } from "@/app/instructors/service/instructor.service";
import {
  buildInstructorPayload,
  getModalFields,
  instructorRecordToForm,
  validateInstructorForm,
} from "@/app/instructors/validation/instructor.validation";
import {
  getInstructorRoleId,
  getInstructorRoleLabel,
  type InstructorRoleRecord,
} from "@/app/instructor-roles/model/instructor-role.model";
import { instructorRoleApi } from "@/app/instructor-roles/service/instructor-role.service";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { Select2Option } from "@/shared/components/Select2";
import { confirmVisibilityChange, showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

export function Instructorpage() {
  const [items, setItems] = useState<InstructorRecord[]>([]);
  const [roles, setRoles] = useState<InstructorRoleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InstructorRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoCleared, setPhotoCleared] = useState(false);

  const roleOptions: Select2Option[] = useMemo(
    () =>
      roles
        .map((role) => ({
          id: getInstructorRoleId(role),
          text: getInstructorRoleLabel(role),
        }))
        .filter((role) => role.id),
    [roles]
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const [instructorsRes, rolesRes] = await Promise.all([
        instructorApi.getAll({ page: 1, pageSize: 500 }),
        instructorRoleApi.getAll({ page: 1, pageSize: 500 }),
      ]);
      setItems((instructorsRes.data ?? []) as InstructorRecord[]);
      setRoles((rolesRes.data ?? []) as InstructorRoleRecord[]);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load instructors");
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
      const name = getInstructorLabel(item).toLowerCase();
      const email = String(item.email ?? "").toLowerCase();
      const phone = String(item.phone ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [items, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const resetPhotoState = () => {
    setPendingPhotoFile(null);
    setPhotoCleared(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(instructorRecordToForm(null));
    setFormErrors({});
    resetPhotoState();
    setShowModal(true);
  };

  const openEdit = async (item: InstructorRecord) => {
    const id = getInstructorRecordId(item);
    if (!id) return;
    setBusyId(id);
    try {
      const record = await instructorApi.getById(id);
      setEditing(record);
      setForm(instructorRecordToForm(record));
      setFormErrors({});
      resetPhotoState();
      setShowModal(true);
    } catch (err) {
      await showError((err as ApiError).message || "Failed to load instructor");
    } finally {
      setBusyId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormErrors({});
    resetPhotoState();
  };

  const handlePendingPhotoChange = (file: File | null) => {
    setPendingPhotoFile(file);
    setPhotoCleared(file === null);
  };

  const handleSubmit = async () => {
    const errors = validateInstructorForm(form, Boolean(editing));
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = buildInstructorPayload(form, Boolean(editing));
    setSubmitting(true);
    try {
      if (pendingPhotoFile) {
        payload.photo = await instructorApi.uploadPhoto(pendingPhotoFile);
      } else if (photoCleared) {
        payload.photo = "";
      }

      if (editing?.id) {
        await instructorApi.update(String(editing.id), payload);
      } else {
        await instructorApi.create(payload);
      }
      toast.success(editing ? "Instructor updated." : "Instructor created.");
      closeModal();
      await fetchItems();
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: InstructorRecord) => {
    const id = getInstructorRecordId(item);
    if (!id) return;
    const nextActive = item.status === "inactive";
    const name = getInstructorLabel(item);
    const confirmed = await confirmVisibilityChange(name, nextActive);
    if (!confirmed) return;

    setBusyId(id);
    try {
      await instructorApi.updateStatus(id, nextActive ? "active" : "inactive");
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Instructors</h1>
        <p className="mt-1 text-sm text-slate-500">Manage course instructors.</p>
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

      <InstructorTable
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
        onToggleStatus={handleToggleStatus}
      />

      <InstructorModal
        open={showModal}
        title={editing ? "Edit Instructor" : "Create Instructor"}
        submitLabel="Save"
        formKey={editing?.id ? String(editing.id) : "create"}
        form={form}
        formErrors={formErrors}
        fields={getModalFields(Boolean(editing))}
        roleOptions={roleOptions}
        pendingPhotoFile={pendingPhotoFile}
        photoCleared={photoCleared}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
        onPendingPhotoChange={handlePendingPhotoChange}
      />
    </div>
  );
}
