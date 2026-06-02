"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, Pencil, Plus, Trash2, User } from "lucide-react";
import type { ApiError } from "@/api/http";
import { DataTable } from "@/components/common/DataTable";
import { Modal } from "@/components/common/Modal";
import { useDebounce } from "@/hooks/useDebounce";
import type { ApiUser } from "@/model/user";
import { getRoles, type Role } from "@/services/role.service";
import {
  createAdmin,
  getAdminUsers,
  softDeleteUser,
  updateUser,
  updateUserStatus,
} from "@/views/users/user.service";

type AdminRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: boolean;
  roleName: string;
  created_at: string;
};

function toAdminRow(u: ApiUser): AdminRow {
  const role =
    u.roleId && typeof u.roleId === "object" && "name" in u.roleId
      ? String(u.roleId.name)
      : "";
  return {
    id: u.id,
    full_name: u.profile?.full_name ?? "",
    email: u.email,
    phone: u.phone ?? "",
    status: u.status,
    roleName: role,
    created_at: u.created_at ?? "",
  };
}

export function AdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [listError, setListError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    status: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const [usersRes, rolesRes] = await Promise.all([
        getAdminUsers({ page: 1, pageSize: 200 }),
        getRoles({ page: 1, pageSize: 100 }),
      ]);
      setAdmins((usersRes.data ?? []).map(toAdminRow));
      setRoles(rolesRes.data ?? []);
    } catch (err) {
      setListError((err as ApiError).message);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return admins;
    const q = debouncedSearch.toLowerCase();
    return admins.filter(
      (a) =>
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  }, [admins, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      roleId: roles[0]?.id ?? "",
      status: true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (admin: AdminRow) => {
    setEditing(admin);
    setForm({
      full_name: admin.full_name,
      email: admin.email,
      phone: admin.phone,
      password: "",
      roleId: "",
      status: admin.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!form.full_name.trim()) errors.full_name = "Required";
    if (!form.email.trim()) errors.email = "Required";
    if (!editing && !form.password.trim()) errors.password = "Required";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await updateUser(editing.id, {
          email: form.email.trim(),
          phone: form.phone.trim(),
          profile: { full_name: form.full_name.trim() },
          status: form.status,
          ...(form.roleId ? { roleId: form.roleId } : {}),
        });
      } else {
        await createAdmin({
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          roleId: form.roleId || undefined,
          profile: { full_name: form.full_name.trim() },
        });
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      setFormErrors({ _form: (err as ApiError).message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (admin: AdminRow) => {
    if (!confirm(`Delete admin "${admin.full_name}"?`)) return;
    setBusyId(admin.id);
    try {
      await softDeleteUser(admin.id);
      await fetchData();
    } catch (err) {
      alert((err as ApiError).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (admin: AdminRow) => {
    setBusyId(admin.id);
    try {
      await updateUserStatus(admin.id, !admin.status);
      await fetchData();
    } catch (err) {
      alert((err as ApiError).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Admin Users</h1>
        <p className="text-sm text-gray-500">API: /users/getall/adminUsers, /users/admin/create</p>
      </div>

      {listError && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {listError}
        </div>
      )}

      <DataTable
        title="Admins"
        data={paginated}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        page={page}
        pageSize={pageSize}
        totalRows={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </button>
        }
        columns={[
          {
            key: "name",
            header: "Name",
            render: (a) => (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-sm font-medium">{a.full_name}</span>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (a) => (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm">{a.email}</span>
              </div>
            ),
          },
          { key: "role", header: "Role", render: (a) => <span className="text-sm">{a.roleName || "—"}</span> },
          {
            key: "status",
            header: "Status",
            render: (a) => (
              <span className={`text-xs font-medium ${a.status ? "text-green-600" : "text-red-600"}`}>
                {a.status ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Action",
            render: (a) => (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(a)}
                  disabled={busyId === a.id}
                  className="rounded px-2 py-1 text-sm text-orange-600 hover:bg-orange-50"
                >
                  {a.status ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a)}
                  disabled={busyId === a.id}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
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
          title={editing ? "Edit Admin" : "Create Admin"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </>
          }
        >
          <div className="grid gap-3.5">
            {formErrors._form && (
              <p className="text-sm text-red-600">{formErrors._form}</p>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Full Name *</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            {!editing && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upper, lower, number & special character required
                </p>
              </div>
            )}
            {!editing && roles.length > 0 && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Role</label>
                <select
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {editing && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.checked })}
                  className="h-4 w-4"
                />
                Active
              </label>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
