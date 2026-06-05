"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { AdminModal, type AdminFormState } from "@/app/admins/components/AdminModal";
import { AdminTable } from "@/app/admins/components/AdminTable";
import { toAdminRow, type AdminRow } from "@/app/admins/model/admin.model";
import {
  createAdmin,
  getAdminUsers,
  updateUser,
  updateUserStatus,
} from "@/app/users/service/user.service";
import type { ApiUser } from "@/app/users/model/user.model";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { confirmStatusChange, showError } from "@/shared/utils/sweetalert";
import { toast } from "@/shared/utils/toast";

const emptyForm = (): AdminFormState => ({
  full_name: "",
  email: "",
  phone: "",
  password: "",
  status: true,
});

export function Adminpage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [form, setForm] = useState<AdminFormState>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const usersRes = await getAdminUsers({ page: 1, pageSize: 200 });
      setAdmins(((usersRes.data ?? []) as ApiUser[]).map(toAdminRow));
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load admins");
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
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q)
    );
  }, [admins, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
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
      status: admin.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!form.full_name.trim()) errors.full_name = "Required";
    if (!form.email.trim()) errors.email = "Required";
    if (!editing && !form.password.trim()) errors.password = "Required";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields");
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
        });
      } else {
        await createAdmin({
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          profile: { full_name: form.full_name.trim() },
        });
      }
      toast.success(editing ? "Updated successfully" : "Created successfully");
      closeModal();
      await fetchData();
    } catch (err) {
      toast.error((err as ApiError).message);
      setFormErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: AdminRow) => {
    const nextActive = !admin.status;
    const name = admin.full_name || admin.email;
    const confirmed = await confirmStatusChange(name, nextActive);
    if (!confirmed) return;

    setBusyId(admin.id);
    try {
      await updateUserStatus(admin.id, nextActive);
      await fetchData();
    } catch (err) {
      await showError((err as ApiError).message || "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin List</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your admins here.</p>
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

      <AdminTable
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

      <AdminModal
        open={showModal}
        title={editing ? "Edit Admin" : "Create"}
        editing={Boolean(editing)}
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
