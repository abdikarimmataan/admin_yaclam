"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageIcon, Loader2, Save, Type } from "lucide-react";
import type { ApiError } from "@/config/api";
import { FileUploadDropzone } from "@/shared/components/FileUploadDropzone";
import { resolveAssetUrl } from "@/shared/utils/asset-url";
import { toast } from "@/shared/utils/toast";
import {
  loadSettings,
  saveSiteBranding,
  uploadFaviconFile,
  uploadLogoFile,
} from "@/app/frontend/services/settings.service";

const DEFAULT_HEADER_TEXT = "Yaclam (يعلم) — Learn Without Limits";
const DEFAULT_LOGO_NAME = "Yaclam";
const DEFAULT_LOGO_HIGHLIGHT = ".";

function LogoNavbarPreview({
  imageUrl,
  showImage,
  showText,
  name,
  highlight,
}: {
  imageUrl?: string;
  showImage: boolean;
  showText: boolean;
  name: string;
  highlight: string;
}) {
  const hasImage = showImage && !!imageUrl?.trim();
  const hasText = showText && !!name.trim();

  return (
    <div className="mt-5 rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Navbar preview
        </p>
      </div>
      <div className="flex h-16 items-center border-b border-gray-100 bg-white/90 px-4 backdrop-blur-sm">
        {hasImage || hasText ? (
          <div
            className={`flex items-center ${hasText ? "gap-2.5 text-[22px] font-extrabold tracking-tight text-[#0a1628]" : ""}`}
          >
            {hasImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt={name.trim() || "Site logo"}
                className="h-9 w-auto max-w-[200px] object-contain"
              />
            )}
            {hasText && (
              <span>
                {name.trim() || DEFAULT_LOGO_NAME}
                <span className="text-[#d4a843]">
                  {highlight || DEFAULT_LOGO_HIGHLIGHT}
                </span>
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            Enable image or text above to see the logo here.
          </p>
        )}
      </div>
      <p className="px-3 py-2 text-xs text-gray-500">
        {hasImage && hasText
          ? "Image and text shown together."
          : hasImage
            ? "Image only."
            : hasText
              ? "Text only."
              : "Nothing visible on the site yet."}
      </p>
    </div>
  );
}

export function SiteBrandingEditor() {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof loadSettings>>>(null);
  const [headerText, setHeaderText] = useState(DEFAULT_HEADER_TEXT);
  const [currentLogoPath, setCurrentLogoPath] = useState("");
  const [currentFaviconPath, setCurrentFaviconPath] = useState("");
  const [logoName, setLogoName] = useState(DEFAULT_LOGO_NAME);
  const [logoHighlight, setLogoHighlight] = useState(DEFAULT_LOGO_HIGHLIGHT);
  const [logoTextVisible, setLogoTextVisible] = useState(true);
  const [logoPictureVisible, setLogoPictureVisible] = useState(true);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingFaviconFile, setPendingFaviconFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await loadSettings();
      setSettings(loaded);
      setRecordId(loaded?.id ? String(loaded.id) : null);
      setHeaderText(loaded?.seo?.title?.trim() || DEFAULT_HEADER_TEXT);
      setCurrentLogoPath(loaded?.logo?.picture?.light?.trim() ?? "");
      setCurrentFaviconPath(loaded?.favicon?.trim() ?? "");
      setLogoName(loaded?.logo?.text?.name?.trim() || DEFAULT_LOGO_NAME);
      setLogoHighlight(loaded?.logo?.text?.highlight ?? DEFAULT_LOGO_HIGHLIGHT);
      setLogoTextVisible(loaded?.logo?.text?.isVisible !== false);
      setLogoPictureVisible(loaded?.logo?.picture?.isVisible !== false);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load site branding");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const localLogoPreview = useMemo(
    () => (pendingLogoFile ? URL.createObjectURL(pendingLogoFile) : ""),
    [pendingLogoFile]
  );
  const localFaviconPreview = useMemo(
    () => (pendingFaviconFile ? URL.createObjectURL(pendingFaviconFile) : ""),
    [pendingFaviconFile]
  );

  useEffect(() => {
    return () => {
      if (localLogoPreview) URL.revokeObjectURL(localLogoPreview);
      if (localFaviconPreview) URL.revokeObjectURL(localFaviconPreview);
    };
  }, [localLogoPreview, localFaviconPreview]);

  const logoPreviewUrl =
    localLogoPreview || (currentLogoPath ? resolveAssetUrl(currentLogoPath) : "");
  const faviconPreviewUrl =
    localFaviconPreview || (currentFaviconPath ? resolveAssetUrl(currentFaviconPath) : "");

  const saveBranding = async () => {
    if (!headerText.trim()) {
      toast.error("Header text is required.");
      return;
    }

    setSaving(true);
    try {
      const logoPath = pendingLogoFile
        ? await uploadLogoFile(pendingLogoFile)
        : currentLogoPath;
      const faviconPath = pendingFaviconFile
        ? await uploadFaviconFile(pendingFaviconFile)
        : currentFaviconPath;

      const saved = await saveSiteBranding(
        {
          logoPath,
          headerText,
          faviconPath,
          logoText: {
            name: logoName,
            highlight: logoHighlight,
            isVisible: logoTextVisible,
          },
          logoPictureVisible,
        },
        recordId,
        settings
      );

      setSettings(saved);
      setRecordId(saved.id ? String(saved.id) : recordId);
      setHeaderText(saved.seo?.title?.trim() || headerText.trim());
      setCurrentLogoPath(saved.logo?.picture?.light?.trim() ?? logoPath);
      setCurrentFaviconPath(saved.favicon?.trim() ?? faviconPath);
      setLogoName(saved.logo?.text?.name?.trim() || logoName.trim() || DEFAULT_LOGO_NAME);
      setLogoHighlight(saved.logo?.text?.highlight ?? logoHighlight);
      setLogoTextVisible(saved.logo?.text?.isVisible !== false);
      setLogoPictureVisible(saved.logo?.picture?.isVisible !== false);
      setPendingLogoFile(null);
      setPendingFaviconFile(null);
      toast.success("Site branding saved. Changes will appear on the public website.");
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to save site branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Site branding</h2>
            <p className="mt-0.5 text-sm text-gray-600">
              Manage the navbar logo, browser tab title, and favicon in one place.
            </p>
          </div>
          {recordId ? (
            <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Published
            </span>
          ) : (
            <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Draft — not saved yet
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 px-6 py-12 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading site branding…
        </div>
      ) : (
        <>
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="border-b border-gray-100 p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <ImageIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Site logo</h3>
                  <p className="text-xs text-gray-500">
                    Image, text, or both — shown in the website navbar
                  </p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={logoPictureVisible}
                    onChange={(e) => setLogoPictureVisible(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                  />
                  <span className="font-medium text-gray-800">Show image</span>
                  <span className="text-xs text-gray-500">
                    {logoPictureVisible ? "Visible" : "Hidden"}
                  </span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={logoTextVisible}
                    onChange={(e) => setLogoTextVisible(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                  />
                  <span className="font-medium text-gray-800">Show text</span>
                  <span className="text-xs text-gray-500">
                    {logoTextVisible ? "Visible" : "Hidden"}
                  </span>
                </label>
              </div>

              <FileUploadDropzone
                size="sm"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.svg"
                file={pendingLogoFile}
                onChange={setPendingLogoFile}
                labelSuffix="site logo"
                helperText="JPEG, PNG, WebP, GIF, SVG · max 25MB"
                maxSizeMb={25}
                previewUrl={logoPreviewUrl || undefined}
                previewInside
                previewAlt="Site logo"
                loading={saving}
              />

              <div className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-gray-800">Text logo</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="logo-name"
                      className="mb-1.5 block text-xs font-semibold text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      id="logo-name"
                      type="text"
                      value={logoName}
                      onChange={(e) => setLogoName(e.target.value)}
                      placeholder={DEFAULT_LOGO_NAME}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="logo-highlight"
                      className="mb-1.5 block text-xs font-semibold text-gray-700"
                    >
                      Highlight
                    </label>
                    <input
                      id="logo-highlight"
                      type="text"
                      value={logoHighlight}
                      onChange={(e) => setLogoHighlight(e.target.value)}
                      placeholder={DEFAULT_LOGO_HIGHLIGHT}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              <LogoNavbarPreview
                imageUrl={logoPreviewUrl || undefined}
                showImage={logoPictureVisible}
                showText={logoTextVisible}
                name={logoName}
                highlight={logoHighlight}
              />
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Type className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Tab header</h3>
                  <p className="text-xs text-gray-500">Browser tab title and favicon</p>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="tab-header-text"
                  className="mb-1.5 block text-sm font-semibold text-gray-800"
                >
                  Header text
                </label>
                <input
                  id="tab-header-text"
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder={DEFAULT_HEADER_TEXT}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <FileUploadDropzone
                size="sm"
                accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.ico,.svg"
                file={pendingFaviconFile}
                onChange={setPendingFaviconFile}
                labelSuffix="favicon"
                helperText="ICO, PNG, JPEG, WebP, GIF, SVG · 16×16 or 32×32 recommended"
                maxSizeMb={25}
                previewUrl={faviconPreviewUrl || undefined}
                previewInside
                previewAlt="Favicon"
                loading={saving}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-gray-500">
              Logo, tab title, and favicon are saved together with one click.
            </p>
            <button
              type="button"
              onClick={saveBranding}
              disabled={saving || !headerText.trim()}
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save branding
                </>
              )}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
