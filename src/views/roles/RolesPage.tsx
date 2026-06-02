"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ApiError } from "@/api/http";
import { DataTable } from "@/components/common/DataTable";
import { Modal } from "@/components/common/Modal";
import { useDebounce } from "@/hooks/useDebounce";
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
  type Role,
} from "@/services/role.service";

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissionsText, setPermissionsText] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRoles({ page: 1, pageSize: 200 });
      setRoles(res.data ?? []);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return roles;
    const q = debouncedSearch.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
    );
  }, [roles, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setPermissionsText("*");
    setIsVisible(true);
    setError("");
    setShowModal(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setName(role.name);
    setDescription(role.description ?? "");
    setPermissionsText((role.permissions ?? []).join(", "));
    setIsVisible(role.isVisible !== false);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const permissions = permissionsText
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    setSubmitting(true);
    setError("");
    try {
      const body = { name: name.trim(), description, permissions, isVisible };
      if (editing) await updateRole(editing.id, body);
      else await createRole(body);
      setShowModal(false);
      await fetchRoles();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await deleteRole(role.id);
      await fetchRoles();
    } catch (err) {
      alert((err as ApiError).message);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Roles</h1>
        <p className="text-sm text-gray-500">API: /role</p>
      </div>

      <DataTable
        title="Roles"
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
            Add Role
          </button>
        }
        columns={[
          {
            key: "name",
            header: "Name",
            render: (r) => <span className="text-sm font-medium">{r.name}</span>,
          },
          {
            key: "desc",
            header: "Description",
            render: (r) => (
              <span className="text-sm text-gray-600">{r.description || "—"}</span>
            ),
          },
          {
            key: "perms",
            header: "Permissions",
            render: (r) => (
              <span className="text-xs text-gray-500">
                {(r.permissions ?? []).join(", ") || "—"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Action",
            render: (r) => (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(r)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
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
          title={editing ? "Edit Role" : "Create Role"}
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
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Permissions (comma-separated)
              </label>
              <input
                value={permissionsText}
                onChange={(e) => setPermissionsText(e.target.value)}
                placeholder="*, view, edit"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4"
              />
              Visible
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
