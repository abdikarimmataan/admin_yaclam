"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "font-sans text-sm shadow-lg border border-slate-200",
          title: "font-semibold",
          description: "text-slate-600 whitespace-pre-line",
        },
      }}
    />
  );
}
