"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ApiError } from "@/config/api";
import type { CmsModuleConfig, FormField } from "@/app/frontend/CMS/config/api-modules";
import { DataTable } from "@/shared/components/DataTable";
import { Modal } from "@/shared/components/Modal";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { CmsRecord } from "@/config/api";
import {
  getRecordLabel,
  pickFormValues,
  setValueByPath,
} from "@/app/frontend/CMS/lib/cms-utils";
import { createCmsApi } from "@/app/frontend/CMS/services/cms-api";

type CmsManagePageProps = {
  config: CmsModuleConfig;
};

function toStringList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value.map((v) => String(v ?? "")).join(", ");
}

function toStatsList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => {
      const row = v as { value?: string; label?: string; isVisible?: boolean };
      return `${row.value ?? ""}|${row.label ?? ""}|${row.isVisible !== false}`;
    })
    .join("\n");
}

function toLinkList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => {
      const row = v as { label?: string; url?: string; isVisible?: boolean };
      return `${row.label ?? ""}|${row.url ?? ""}|${row.isVisible !== false}`;
    })
    .join("\n");
}

function toPaymentList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => {
      const row = v as { name?: string; icon?: string; isVisible?: boolean };
      return `${row.name ?? ""}|${row.icon ?? ""}|${row.isVisible !== false}`;
    })
    .join("\n");
}

function toStepsList(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => {
      const row = v as {
        title?: string;
        description?: string;
        order?: number;
        isVisible?: boolean;
      };
      return `${row.title ?? ""}|${row.description ?? ""}|${row.order ?? 0}|${row.isVisible !== false}`;
    })
    .join("\n");
}

function parseBoolText(input: string, fallback = true) {
  if (!input.trim()) return fallback;
  return !["false", "0", "no", "off"].includes(input.trim().toLowerCase());
}

export function CmsManagePage({ config }: CmsManagePageProps) {
  const statusField = config.statusField ?? "status";
  const togglesIsVisible = config.hasStatus && statusField === "isVisible";

  const api = useMemo(
    () =>
      createCmsApi(config.apiPath, {
        path: config.statusPath,
        field: config.statusField,
      }),
    [config.apiPath, config.statusPath, config.statusField]
  );

  const [items, setItems] = useState<CmsRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [listError, setListError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CmsRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fieldKeys = useMemo(
    () => config.formFields?.map((f) => f.key) ?? [],
    [config.formFields]
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await api.getAll({ page: 1, pageSize: 500 });
      setItems((res.data ?? []) as CmsRecord[]);
    } catch (err) {
      setListError((err as ApiError).message || "Failed to load data");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((item) => {
      const label = getRecordLabel(item).toLowerCase();
      const slug = String(item.slug ?? "").toLowerCase();
      return label.includes(q) || slug.includes(q);
    });
  }, [items, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    const initial = pickFormValues(null, fieldKeys);
    config.formFields?.forEach((f) => {
      if (f.type === "statsList") initial[f.key] = "";
      if (f.type === "linkList") initial[f.key] = "";
      if (f.type === "paymentList") initial[f.key] = "";
      if (f.type === "stepsList") initial[f.key] = "";
      if (f.type === "stringList") initial[f.key] = "";
    });
    setForm(initial);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (item: CmsRecord) => {
    setEditing(item);
    const initial = pickFormValues(item, fieldKeys);
    config.formFields?.forEach((f) => {
      if (f.type === "statsList") initial[f.key] = toStatsList(initial[f.key]);
      if (f.type === "linkList") initial[f.key] = toLinkList(initial[f.key]);
      if (f.type === "paymentList") initial[f.key] = toPaymentList(initial[f.key]);
      if (f.type === "stepsList") initial[f.key] = toStepsList(initial[f.key]);
      if (f.type === "stringList") initial[f.key] = toStringList(initial[f.key]);
    });
    setForm(initial);
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormErrors({});
  };

  const buildPayload = (): Record<string, unknown> | null => {
    const errors: Record<string, string> = {};
    config.formFields?.forEach((f) => {
      if (f.required && !String(form[f.key] ?? "").trim() && f.type !== "boolean") {
        errors[f.key] = `${f.label} is required`;
      }
      if (
        (f.type === "statsList" ||
          f.type === "linkList" ||
          f.type === "paymentList" ||
          f.type === "stepsList") &&
        String(form[f.key] ?? "").trim()
      ) {
        const lines = String(form[f.key]).split("\n").filter((l) => l.trim());
        const requiredParts =
          f.type === "stepsList" ? 4 : f.type === "paymentList" ? 3 : 3;
        const badLine = lines.find((l) => l.split("|").length < requiredParts);
        if (badLine) errors[f.key] = `${f.label} has invalid line format`;
      }
    });
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return null;
    }

    const payload: Record<string, unknown> = {};
    config.formFields?.forEach((f) => {
      const raw = form[f.key];
      let value: unknown = raw;
      if (f.type === "number") {
        const num = Number(raw);
        value = Number.isFinite(num) ? num : 0;
      } else if (f.type === "stringList") {
        value = String(raw ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (f.type === "statsList") {
        value = String(raw ?? "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => {
            const [val = "", label = "", visible = "true"] = line.split("|");
            return { value: val.trim(), label: label.trim(), isVisible: parseBoolText(visible, true) };
          });
      } else if (f.type === "linkList") {
        value = String(raw ?? "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => {
            const [label = "", url = "", visible = "true"] = line.split("|");
            return { label: label.trim(), url: url.trim(), isVisible: parseBoolText(visible, true) };
          });
      } else if (f.type === "paymentList") {
        value = String(raw ?? "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => {
            const [name = "", icon = "", visible = "true"] = line.split("|");
            return { name: name.trim(), icon: icon.trim(), isVisible: parseBoolText(visible, true) };
          });
      } else if (f.type === "stepsList") {
        value = String(raw ?? "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => {
            const [title = "", description = "", order = "0", visible = "true"] =
              line.split("|");
            return {
              title: title.trim(),
              description: description.trim(),
              order: Number(order) || 0,
              isVisible: parseBoolText(visible, true),
            };
          });
      } else if (f.type === "text" || f.type === "textarea" || f.type === "email") {
        value = String(raw ?? "");
      } else if (f.type === "boolean") {
        value = !!raw;
      }

      if (value !== undefined) {
        setValueByPath(payload, f.key, value);
      }
    });
    return payload;
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) return;

    setSubmitting(true);
    try {
      if (editing?.id) {
        await api.update(String(editing.id), payload);
      } else {
        await api.create(payload);
      }
      closeModal();
      await fetchItems();
    } catch (err) {
      const apiErr = err as ApiError;
      setFormErrors({ _form: apiErr.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: CmsRecord) => {
    if (!item.id || !confirm(`Delete "${getRecordLabel(item)}"?`)) return;
    setBusyId(String(item.id));
    try {
      await api.remove(String(item.id));
      await fetchItems();
    } catch (err) {
      alert((err as ApiError).message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (item: CmsRecord) => {
    if (!item.id || !config.hasStatus) return;
    const current =
      statusField === "isVisible" ? item.isVisible !== false : Boolean(item.status);
    setBusyId(String(item.id));
    try {
      await api.updateStatus(String(item.id), !current);
      await fetchItems();
    } catch (err) {
      alert((err as ApiError).message || "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  const renderField = (field: FormField) => {
    const value = form[field.key];
    const err = formErrors[field.key];

    if (field.type === "boolean") {
      return (
        <label key={field.key} className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          {field.label}
        </label>
      );
    }

    const common = `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      err ? "border-red-300" : "border-gray-300"
    }`;

    if (field.type === "textarea") {
      return (
        <div key={field.key}>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          <textarea
            rows={3}
            value={String(value ?? "")}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            className={common}
          />
          {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
        </div>
      );
    }

    if (
      field.type === "statsList" ||
      field.type === "linkList" ||
      field.type === "paymentList" ||
      field.type === "stepsList"
    ) {
      const placeholder =
        field.type === "statsList"
          ? "value|label|isVisible  (one per line)"
          : field.type === "linkList"
            ? "label|url|isVisible  (one per line)"
            : field.type === "paymentList"
              ? "name|icon|isVisible  (one per line)"
              : "title|description|order|isVisible  (one per line)";
      return (
        <div key={field.key}>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          <textarea
            rows={4}
            value={String(value ?? "")}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            className={`${common} font-mono text-xs`}
            placeholder={placeholder}
          />
          <p className="mt-1 text-xs text-gray-500">
            Use `|` separator. Example boolean values: true/false.
          </p>
          {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
        </div>
      );
    }

    if (field.type === "stringList") {
      return (
        <div key={field.key}>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            className={common}
            placeholder="item1, item2, item3"
          />
          {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
        </div>
      );
    }

    return (
      <div key={field.key}>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
          value={field.type === "number" ? Number(value ?? 0) : String(value ?? "")}
          onChange={(e) =>
            setForm({
              ...form,
              [field.key]:
                field.type === "number" ? Number(e.target.value) : e.target.value,
            })
          }
          className={common}
        />
        {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
      </div>
    );
  };

  const hideCreate = config.singleRecord && items.length > 0;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{config.label}</h1>
          <p className="text-sm text-gray-500">
            API: <code className="text-xs text-gray-600">{config.apiPath}</code>
          </p>
        </div>
      </div>

      {listError && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {listError}
        </div>
      )}

      <DataTable
        title={config.label}
        data={paginated}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        page={page}
        pageSize={pageSize}
        totalRows={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        actions={
          hideCreate ? undefined : (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex w-fit items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          )
        }
        columns={[
          {
            key: "label",
            header: "Name",
            render: (item) => (
              <span className="text-sm font-medium text-gray-900">
                {getRecordLabel(item)}
              </span>
            ),
          },
          {
            key: "slug",
            header: "Slug",
            render: (item) => (
              <span className="text-sm text-gray-600">{String(item.slug ?? "—")}</span>
            ),
          },
          {
            key: "visible",
            header: "Visible",
            render: (item) =>
              togglesIsVisible ? (
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.isVisible !== false}
                    disabled={busyId === item.id}
                    onChange={() => handleToggleStatus(item)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 disabled:opacity-50"
                    aria-label={`Toggle visibility for ${getRecordLabel(item)}`}
                  />
                  <span className="text-xs text-gray-600">
                    {item.isVisible === false ? "Hidden" : "Visible"}
                  </span>
                </label>
              ) : (
                <span className="text-xs text-gray-600">
                  {item.isVisible === false ? "Hidden" : "Yes"}
                </span>
              ),
          },
          ...(!togglesIsVisible
            ? [
                {
                  key: "status",
                  header: "Status",
                  render: (item: CmsRecord) =>
                    config.hasStatus ? (
                      <span
                        className={`text-xs font-medium ${item.status ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    ),
                },
              ]
            : []),
          {
            key: "actions",
            header: "Action",
            render: (item) => (
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  disabled={busyId === item.id}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                {config.hasStatus && !togglesIsVisible && (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    disabled={busyId === item.id}
                    className="rounded px-2 py-1 text-sm text-orange-600 hover:bg-orange-50"
                  >
                    Toggle
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={busyId === item.id}
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
          title={editing ? `Edit ${config.label}` : `Create ${config.label}`}
          onClose={closeModal}
          variant="center"
          footer={
            <>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </>
          }
        >
          <div className="grid max-h-[60vh] gap-3.5 overflow-y-auto">
            {formErrors._form && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formErrors._form}
              </p>
            )}
            {config.formFields?.map(renderField)}
          </div>
        </Modal>
      )}
    </div>
  );
}
