"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ApiError } from "@/config/api";
import { FileUploadDropzone } from "@/shared/components/FileUploadDropzone";
import { resolveAssetUrl } from "@/shared/utils/asset-url";
import { toast } from "@/shared/utils/toast";
import {
  loadSettings,
  saveSiteLogo,
  uploadLogoFile,
} from "@/app/frontend/services/settings.service";

export function SiteLogoEditor() {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof loadSettings>>>(null);
  const [currentLogoPath, setCurrentLogoPath] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await loadSettings();
      setSettings(loaded);
      setRecordId(loaded?.id ? String(loaded.id) : null);
      setCurrentLogoPath(loaded?.logo?.picture?.light?.trim() ?? "");
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load site logo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const localPreviewUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : ""),
    [pendingFile]
  );

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const previewUrl =
    localPreviewUrl || (currentLogoPath ? resolveAssetUrl(currentLogoPath) : "");

  const saveLogo = async () => {
    if (!pendingFile && !currentLogoPath) {
      toast.error("Choose a logo image to upload.");
      return;
    }

    setSaving(true);
    try {
      const logoPath = pendingFile ? await uploadLogoFile(pendingFile) : currentLogoPath;
      const saved = await saveSiteLogo(logoPath, recordId, settings);
      setSettings(saved);
      setRecordId(saved.id ? String(saved.id) : recordId);
      setCurrentLogoPath(saved.logo?.picture?.light?.trim() ?? logoPath);
      setPendingFile(null);
      toast.success("Site logo saved. It will appear on the public website.");
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to save site logo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Site logo</h2>
          <p className="text-sm text-gray-600">
            Upload the logo shown in the website navbar.
          </p>
        </div>
        {recordId ? (
          <span className="text-xs font-medium text-green-700">Saved on website</span>
        ) : (
          <span className="text-xs font-medium text-amber-700">Not saved yet</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading site logo…
        </div>
      ) : (
        <>
          <FileUploadDropzone
            size="sm"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.svg"
            file={pendingFile}
            onChange={setPendingFile}
            labelSuffix="site logo"
            helperText="JPEG, PNG, WebP, GIF, SVG · max 25MB"
            maxSizeMb={25}
            previewUrl={previewUrl || undefined}
            previewInside
            previewAlt="Site logo"
            loading={saving}
          />

          <div className="mt-4 flex justify-end border-t border-emerald-100 pt-4">
            <button
              type="button"
              onClick={saveLogo}
              disabled={saving || (!pendingFile && !currentLogoPath)}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save site logo"
              )}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
