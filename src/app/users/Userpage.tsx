"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import type { ApiError } from "@/config/api";
import { DataTable } from "@/shared/components/DataTable";
import { Modal } from "@/shared/components/Modal";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { toStudentRow, type ApiUser, type StudentRow } from "@/app/users/model/user.model";
import {
  getStudents,
  registerStudent,
  softDeleteUser,
  updateUser,
  updateUserStatus,
} from "@/app/users/service/user.service";

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  status: boolean;
  approve: boolean;
};

const emptyForm: FormState = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  status: true,
  approve: true,
};

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function Userpage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StudentRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [listError, setListError] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await getStudents({ page: 1, pageSize: 500 });
      const rows = ((res.data ?? []) as ApiUser[]).map(toStudentRow);
      setStudents(rows);
    } catch (err) {
      const apiErr = err as ApiError;
      setListError(apiErr.message || "Failed to load students");
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

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.full_name.trim()) errors.full_name = "Full name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Invalid email format";
    if (!editingUser && !form.password.trim()) errors.password = "Password is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

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
      closeModal();
      await fetchStudents();
    } catch (err) {
      const apiErr = err as ApiError;
      applyApiFieldErrors(apiErr);
      if (!apiErr.errors?.length) {
        setFormErrors({ _form: apiErr.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: StudentRow) => {
    if (!confirm(`Delete student "${user.full_name}"?`)) return;

    setBusyId(user.id);
    try {
      await softDeleteUser(user.id);
      await fetchStudents();
    } catch (err) {
      alert((err as ApiError).message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (user: StudentRow) => {
    setBusyId(user.id);
    try {
      await updateUserStatus(user.id, !user.status);
      await fetchStudents();
    } catch (err) {
      alert((err as ApiError).message || "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleApprove = async (user: StudentRow) => {
    setBusyId(user.id);
    try {
      await updateUser(user.id, { approve: !user.approve });
      await fetchStudents();
    } catch (err) {
      alert((err as ApiError).message || "Approval update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">Manage registered students</p>
        </div>
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5">
          <span className="text-sm font-medium text-blue-600">
            Total: {filtered.length}
          </span>
        </div>
      </div>

      {listError && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {listError}
        </div>
      )}

      <DataTable
        title="Student List"
        data={paginated}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or phone..."
        page={page}
        pageSize={pageSize}
        totalRows={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </button>
        }
        columns={[
          {
            key: "name",
            header: "Full Name",
            render: (u) => (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">{u.full_name}</span>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (u) => (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm text-gray-600">{u.email}</span>
              </div>
            ),
          },
          {
            key: "phone",
            header: "Phone",
            render: (u) => (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm text-gray-600">{u.phone || "-"}</span>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (u) =>
              u.status ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  <XCircle className="h-3 w-3" />
                  Inactive
                </span>
              ),
          },
          {
            key: "approve",
            header: "Approved",
            render: (u) =>
              u.approve ? (
                <span className="text-xs font-medium text-green-600">Yes</span>
              ) : (
                <span className="text-xs font-medium text-amber-600">Pending</span>
              ),
          },
          {
            key: "created",
            header: "Created",
            render: (u) => (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm text-gray-600">{formatDate(u.created_at)}</span>
              </div>
            ),
          },
          {
            key: "actions",
            header: "Action",
            render: (u) => (
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(u)}
                  disabled={busyId === u.id}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(u)}
                  disabled={busyId === u.id}
                  className={`rounded px-2 py-1 text-sm font-medium disabled:opacity-50 ${
                    u.status
                      ? "text-orange-600 hover:bg-orange-50"
                      : "text-green-600 hover:bg-green-50"
                  }`}
                >
                  {u.status ? "Deactivate" : "Activate"}
                </button>
                {!u.approve && (
                  <button
                    type="button"
                    onClick={() => handleToggleApprove(u)}
                    disabled={busyId === u.id}
                    className="rounded px-2 py-1 text-sm font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(u)}
                  disabled={busyId === u.id}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      {showModal && (
        <Modal
          title={editingUser ? "Edit Student" : "Add Student"}
          onClose={closeModal}
          variant="center"
          footer={
            <>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingUser ? "Update" : "Create"}
              </button>
            </>
          }
        >
          <div className="grid gap-3.5">
            {formErrors._form && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formErrors._form}
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.full_name ? "border-red-300" : "border-gray-300"
                }`}
              />
              {formErrors.full_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.full_name}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.email ? "border-red-300" : "border-gray-300"
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!editingUser && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.password ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Min 6 chars with upper, lower, number & special character
                </p>
              </div>
            )}

            {editingUser && (
              <>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Active account
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.approve}
                    onChange={(e) => setForm({ ...form, approve: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Approved
                </label>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
