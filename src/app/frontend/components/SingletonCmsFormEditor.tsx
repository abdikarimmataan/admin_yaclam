"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { ApiError } from "@/config/api";
import type { FormField } from "@/app/frontend/CMS/config/api-modules";
import type { CmsFormPanel } from "@/app/frontend/CMS/config/course-cms-sections";
import { CollapsibleFormPanel } from "@/app/frontend/CMS/components/CollapsibleFormPanel";
import { buildFormPayload, emptyFormValues, recordToFormValues } from "@/app/frontend/CMS/lib/cms-form";
import type { CmsRecord } from "@/config/api";
import { loadSingleton, saveSingleton } from "@/app/frontend/CMS/services/singleton-cms";

type BlockState = {
  recordId: string | null;
  form: Record<string, unknown>;
  loading: boolean;
  saving: boolean;
  errors: Record<string, string>;
  message: string;
  messageType: "success" | "error" | "";
};

function initialBlockState(): BlockState {
  return {
    recordId: null,
    form: {},
    loading: true,
    saving: false,
    errors: {},
    message: "",
    messageType: "",
  };
}

type SingletonCmsFormEditorProps = {
  pageTitle: string;
  blockTitle: string;
  apiPath: string;
  fields: FormField[];
  panels: CmsFormPanel[];
  getPanelFields: (panel: CmsFormPanel) => FormField[];
  saveButtonLabel: string;
  loadMessage?: string;
  createdMessage?: string;
  updatedMessage?: string;
  accent?: "blue" | "emerald" | "violet" | "slate";
  formDefaults?: Record<string, unknown>;
  preparePayload?: (payload: Record<string, unknown>) => Record<string, unknown>;
};

const accentStyles = {
  blue: {
    section: "border-blue-100 bg-blue-50/30",
    border: "border-blue-100",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  emerald: {
    section: "border-emerald-100 bg-emerald-50/30",
    border: "border-emerald-100",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
  violet: {
    section: "border-violet-100 bg-violet-50/30",
    border: "border-violet-100",
    button: "bg-violet-600 hover:bg-violet-700",
  },
  slate: {
    section: "border-slate-200 bg-slate-50/50",
    border: "border-slate-200",
    button: "bg-slate-700 hover:bg-slate-800",
  },
};

export function SingletonCmsFormEditor({
  pageTitle,
  blockTitle,
  apiPath,
  fields,
  panels,
  getPanelFields,
  saveButtonLabel,
  loadMessage = "Loading…",
  createdMessage = "Content created.",
  updatedMessage = "Content updated.",
  accent = "blue",
  formDefaults,
  preparePayload,
}: SingletonCmsFormEditorProps) {
  const styles = accentStyles[accent];
  const [block, setBlock] = useState<BlockState>(() => initialBlockState());

  const load = useCallback(async () => {
    setBlock((s) => ({ ...s, loading: true, message: "", messageType: "" }));
    try {
      const { record, error } = await loadSingleton(apiPath);
      setBlock((s) => ({
        ...s,
        recordId: record?.id ? String(record.id) : null,
        form: record
          ? recordToFormValues(record, fields)
          : { ...emptyFormValues(fields), ...formDefaults },
        loading: false,
        message: error ?? "",
        messageType: error ? "error" : "",
      }));
    } catch {
      setBlock((s) => ({
        ...s,
        loading: false,
        form: { ...emptyFormValues(fields), ...formDefaults },
        message: "Failed to load",
        messageType: "error",
      }));
    }
  }, [apiPath, fields, formDefaults]);

  useEffect(() => {
    load();
  }, [load]);

  const patchForm = (key: string, value: unknown) => {
    setBlock((s) => ({
      ...s,
      form: { ...s.form, [key]: value },
      message: "",
      messageType: "",
    }));
  };

  const save = async () => {
    const { payload, errors } = buildFormPayload(block.form, fields);
    if (!payload) {
      setBlock((s) => ({ ...s, errors }));
      return;
    }

    const hadRecord = Boolean(block.recordId);
    const body = preparePayload ? preparePayload(payload) : payload;
    setBlock((s) => ({ ...s, saving: true, errors: {}, message: "", messageType: "" }));

    try {
      const saved = await saveSingleton(apiPath, block.recordId, body);
      setBlock((s) => ({
        ...s,
        recordId: saved.id ? String(saved.id) : s.recordId,
        form: recordToFormValues(saved as CmsRecord, fields),
        saving: false,
        message: hadRecord ? updatedMessage : createdMessage,
        messageType: "success",
      }));
    } catch (err) {
      setBlock((s) => ({
        ...s,
        saving: false,
        message: (err as ApiError).message || "Save failed",
        messageType: "error",
      }));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>

      <section className={`rounded-xl border p-4 sm:p-5 ${styles.section}`}>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-gray-900">{blockTitle}</h2>
          {block.recordId ? (
            <span className="text-xs font-medium text-green-700">
              Record exists — updates on save
            </span>
          ) : (
            <span className="text-xs font-medium text-amber-700">
              No record yet — creates on save
            </span>
          )}
        </div>

        {block.loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadMessage}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {panels.map((panel, i) => (
                <CollapsibleFormPanel
                  key={panel.id}
                  id={panel.id}
                  title={panel.title}
                  description={panel.description}
                  fields={getPanelFields(panel)}
                  form={block.form}
                  errors={block.errors}
                  onChange={patchForm}
                  defaultOpen={i === 0}
                />
              ))}
            </div>

            {block.message && (
              <p
                className={`mt-3 flex items-center gap-1.5 text-sm ${
                  block.messageType === "success" ? "text-green-700" : "text-red-600"
                }`}
              >
                {block.messageType === "success" && (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                {block.message}
              </p>
            )}

            <div className={`mt-4 flex justify-end border-t pt-4 ${styles.border}`}>
              <button
                type="button"
                onClick={save}
                disabled={block.saving}
                className={`inline-flex min-w-[140px] items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${styles.button}`}
              >
                {block.saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  saveButtonLabel
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
