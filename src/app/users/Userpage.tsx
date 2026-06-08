"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { StudentModal, type StudentFormState } from "@/app/users/components/StudentModal";
import { StudentTable } from "@/app/users/components/StudentTable";
import { toStudentRow, type ApiUser, type StudentRow } from "@/app/users/model/user.model";
import {
  getStudents,
  registerStudent,
  softDeleteUser,
  updateUser,
  updateUserStatus,
} from "@/app/users/service/user.service";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { confirmDelete, confirmStatusChange, showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

const emptyForm = (): StudentFormState => ({
  full_name: "",
  email: "",
  phone: "",
  password: "",
  status: true,
  approve: true,
});

export function Userpage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StudentRow | null>(null);
  const [form, setForm] = useState<StudentFormState>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudents({ page: 1, pageSize: 500 });
      const rows = ((res.data ?? []) as ApiUser[]).map(toStudentRow);
      setStudents(rows);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return students;
    const q = debouncedSearch.toLowerCase();
    return students.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
    );
  }, [students, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm());
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (user: StudentRow) => {
    setEditingUser(user);
    setForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      password: "",
      status: user.status,
      approve: user.approve,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormErrors({});
  };

  const applyApiFieldErrors = (err: ApiError) => {
    if (!err.errors?.length) return;
    const map: Record<string, string> = {};
    err.errors.forEach((e) => {
      const key = e.field.includes("profile.") ? "full_name" : e.field;
      map[key] = e.message;
    });
    setFormErrors(map);
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!form.full_name.trim()) errors.full_name = "Required";
    if (!form.email.trim()) errors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Invalid email format";
    if (!editingUser && !form.password.trim()) errors.password = "Required";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          email: form.email.trim(),
          phone: form.phone.trim(),
          profile: { full_name: form.full_name.trim() },
          status: form.status,
          approve: form.approve,
        });
      } else {
        await registerStudent({
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          profile: { full_name: form.full_name.trim() },
        });
      }
      toast.success(editingUser ? "Updated successfully" : "Created successfully");
      closeModal();
      await fetchStudents();
    } catch (err) {
      const apiErr = err as ApiError;
      applyApiFieldErrors(apiErr);
      if (!apiErr.errors?.length) {
        toast.error(apiErr.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: StudentRow) => {
    const name = user.full_name || user.email;
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;

    setBusyId(user.id);
    try {
      await softDeleteUser(user.id);
      await fetchStudents();
    } catch (err) {
      await showError((err as ApiError).message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (user: StudentRow) => {
    const nextActive = !user.status;
    const name = user.full_name || user.email;
    const confirmed = await confirmStatusChange(name, nextActive);
    if (!confirmed) return;

    setBusyId(user.id);
    try {
      await updateUserStatus(user.id, nextActive);
      await fetchStudents();
    } catch (err) {
      await showError((err as ApiError).message || "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleApprove = async (user: StudentRow) => {
    setBusyId(user.id);
    try {
      await updateUser(user.id, { approve: true });
      await fetchStudents();
    } catch (err) {
      await showError((err as ApiError).message || "Approval update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student List</h1>
        <p className="mt-1 text-sm text-slate-500">Manage registered students here.</p>
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

      <StudentTable
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
        onToggleApprove={handleToggleApprove}
        onDelete={handleDelete}
      />

      <StudentModal
        open={showModal}
        title={editingUser ? "Edit Student" : "Create"}
        editing={Boolean(editingUser)}
        form={form}
        formErrors={formErrors}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
      />
    </div>
  );
}
