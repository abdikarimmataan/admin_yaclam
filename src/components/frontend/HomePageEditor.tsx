"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { ApiError } from "@/api/http";
import { CollapsibleFormPanel } from "@/components/cms/CollapsibleFormPanel";
import {
  HOME_API_PATH,
  HOME_SECTIONS_API_PATH,
  HOME_SECTIONS_FORM_DEFAULTS,
} from "@/config/home-cms-fields";
import {
  ALL_HOME_CMS_FIELDS,
  ALL_HOME_SECTIONS_FIELDS,
  HOME_CMS_PANELS,
  HOME_SECTIONS_PANELS,
  getHomeCmsPanelFields,
  getHomeSectionsPanelFields,
} from "@/config/home-page-sections";
import { buildFormPayload, emptyFormValues, recordToFormValues } from "@/lib/cms-form";
import type { CmsRecord } from "@/model/api";
import { loadSingleton, saveSingleton } from "@/services/singleton-cms.service";

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

function emptyHomeSectionsForm(): Record<string, unknown> {
  return {
    ...emptyFormValues(ALL_HOME_SECTIONS_FIELDS),
    ...HOME_SECTIONS_FORM_DEFAULTS,
  };
}

export function HomePageEditor() {
  const [homeBlock, setHomeBlock] = useState<BlockState>(() => initialBlockState());
  const [sectionsBlock, setSectionsBlock] = useState<BlockState>(() => initialBlockState());

  const loadHome = useCallback(async () => {
    setHomeBlock((s) => ({ ...s, loading: true, message: "", messageType: "" }));
    try {
      const { record, error } = await loadSingleton(HOME_API_PATH);
      setHomeBlock((s) => ({
        ...s,
        recordId: record?.id ? String(record.id) : null,
        form: record
          ? recordToFormValues(record, ALL_HOME_CMS_FIELDS)
          : emptyFormValues(ALL_HOME_CMS_FIELDS),
        loading: false,
        message: error ?? "",
        messageType: error ? "error" : "",
      }));
    } catch (err) {
      setHomeBlock((s) => ({
        ...s,
        loading: false,
        form: emptyFormValues(ALL_HOME_CMS_FIELDS),
        message: (err as ApiError).message || "Failed to load home content",
        messageType: "error",
      }));
    }
  }, []);

  const loadSections = useCallback(async () => {
    setSectionsBlock((s) => ({ ...s, loading: true, message: "", messageType: "" }));
    try {
      const { record, error } = await loadSingleton(HOME_SECTIONS_API_PATH);
      setSectionsBlock((s) => ({
        ...s,
        recordId: record?.id ? String(record.id) : null,
        form: record
          ? recordToFormValues(record, ALL_HOME_SECTIONS_FIELDS)
          : emptyHomeSectionsForm(),
        loading: false,
        message: error ?? "",
        messageType: error ? "error" : "",
      }));
    } catch (err) {
      setSectionsBlock((s) => ({
        ...s,
        loading: false,
        form: emptyHomeSectionsForm(),
        message: (err as ApiError).message || "Failed to load home sections",
        messageType: "error",
      }));
    }
  }, []);

  useEffect(() => {
    loadHome();
    loadSections();
  }, [loadHome, loadSections]);

  const patchHomeForm = (key: string, value: unknown) => {
    setHomeBlock((s) => ({
      ...s,
      form: { ...s.form, [key]: value },
      message: "",
      messageType: "",
    }));
  };

  const patchSectionsForm = (key: string, value: unknown) => {
    setSectionsBlock((s) => ({
      ...s,
      form: { ...s.form, [key]: value },
      message: "",
      messageType: "",
    }));
  };

  const saveHome = async () => {
    const { payload, errors } = buildFormPayload(homeBlock.form, ALL_HOME_CMS_FIELDS);
    if (!payload) {
      setHomeBlock((s) => ({ ...s, errors }));
      return;
    }

    setHomeBlock((s) => ({ ...s, saving: true, errors: {}, message: "", messageType: "" }));
    try {
      const saved = await saveSingleton(
        HOME_API_PATH,
        homeBlock.recordId,
        payload
      );
      setHomeBlock((s) => ({
        ...s,
        recordId: saved.id ? String(saved.id) : s.recordId,
        form: recordToFormValues(saved as CmsRecord, ALL_HOME_CMS_FIELDS),
        saving: false,
        message: homeBlock.recordId ? "Home content updated." : "Home content created.",
        messageType: "success",
      }));
    } catch (err) {
      setHomeBlock((s) => ({
        ...s,
        saving: false,
        message: (err as ApiError).message || "Save failed",
        messageType: "error",
      }));
    }
  };

  const saveSections = async () => {
    const { payload, errors } = buildFormPayload(
      sectionsBlock.form,
      ALL_HOME_SECTIONS_FIELDS
    );
    if (!payload) {
      setSectionsBlock((s) => ({ ...s, errors }));
      return;
    }

    // Keep document visible in public getAll (API filters isVisible !== false)
    payload.isVisible = true;

    setSectionsBlock((s) => ({ ...s, saving: true, errors: {}, message: "", messageType: "" }));
    try {
      const saved = await saveSingleton(
        HOME_SECTIONS_API_PATH,
        sectionsBlock.recordId,
        payload
      );
      setSectionsBlock((s) => ({
        ...s,
        recordId: saved.id ? String(saved.id) : s.recordId,
        form: recordToFormValues(saved as CmsRecord, ALL_HOME_SECTIONS_FIELDS),
        saving: false,
        message: sectionsBlock.recordId
          ? "Home sections updated."
          : "Home sections created.",
        messageType: "success",
      }));
    } catch (err) {
      setSectionsBlock((s) => ({
        ...s,
        saving: false,
        message: (err as ApiError).message || "Save failed",
        messageType: "error",
      }));
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Home Page</h1>

      {/* Block 1: /home */}
      <section className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-gray-900">Home content</h2>
          {homeBlock.recordId ? (
            <span className="text-xs font-medium text-green-700">Record exists — updates on save</span>
          ) : (
            <span className="text-xs font-medium text-amber-700">No record yet — creates on save</span>
          )}
        </div>

        {homeBlock.loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading home content…
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {HOME_CMS_PANELS.map((panel, i) => (
                <CollapsibleFormPanel
                  key={panel.id}
                  id={panel.id}
                  title={panel.title}
                  description={panel.description}
                  fields={getHomeCmsPanelFields(panel)}
                  form={homeBlock.form}
                  errors={homeBlock.errors}
                  onChange={patchHomeForm}
                  defaultOpen={i === 0}
                />
              ))}
            </div>

            {homeBlock.message && (
              <p
                className={`mt-3 flex items-center gap-1.5 text-sm ${
                  homeBlock.messageType === "success" ? "text-green-700" : "text-red-600"
                }`}
              >
                {homeBlock.messageType === "success" && (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                {homeBlock.message}
              </p>
            )}

            <div className="mt-4 flex justify-end border-t border-blue-100 pt-4">
              <button
                type="button"
                onClick={saveHome}
                disabled={homeBlock.saving}
                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {homeBlock.saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save home content"
                )}
              </button>
            </div>
          </>
        )}
      </section>

      {/* Block 2: /home_sections */}
      <section className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-gray-900">Home sections</h2>
          {sectionsBlock.recordId ? (
            <span className="text-xs font-medium text-green-700">Record exists — updates on save</span>
          ) : (
            <span className="text-xs font-medium text-amber-700">No record yet — creates on save</span>
          )}
        </div>

        {sectionsBlock.loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading home sections…
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {HOME_SECTIONS_PANELS.map((panel, i) => (
                <CollapsibleFormPanel
                  key={panel.id}
                  id={panel.id}
                  title={panel.title}
                  description={panel.description}
                  fields={getHomeSectionsPanelFields(panel)}
                  form={sectionsBlock.form}
                  errors={sectionsBlock.errors}
                  onChange={patchSectionsForm}
                  defaultOpen={i === 0}
                />
              ))}
            </div>

            {sectionsBlock.message && (
              <p
                className={`mt-3 flex items-center gap-1.5 text-sm ${
                  sectionsBlock.messageType === "success" ? "text-green-700" : "text-red-600"
                }`}
              >
                {sectionsBlock.messageType === "success" && (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                {sectionsBlock.message}
              </p>
            )}

            <div className="mt-4 flex justify-end border-t border-violet-100 pt-4">
              <button
                type="button"
                onClick={saveSections}
                disabled={sectionsBlock.saving}
                className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-md bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {sectionsBlock.saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save home sections"
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
