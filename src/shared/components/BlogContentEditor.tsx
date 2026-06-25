"use client";

import dynamic from "next/dynamic";
import type { CkEditorBlogFieldProps } from "@/shared/components/ckeditor/CkEditorBlogField";

const CkEditorBlogField = dynamic(() => import("@/shared/components/ckeditor/CkEditorBlogField"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-500">
      Loading editor…
    </div>
  ),
});

export function BlogContentEditor(props: CkEditorBlogFieldProps) {
  return <CkEditorBlogField {...props} />;
}
