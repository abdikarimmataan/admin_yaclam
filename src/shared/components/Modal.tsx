"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  children: ReactNode;
  title: string;
  onClose: () => void;
  variant?: "top" | "center" | "drawer-right";
  footer?: ReactNode;
}

export function Modal({
  children,
  title,
  onClose,
  variant = "center",
  footer,
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const containerPos =
    variant === "center"
      ? "items-center justify-center"
      : variant === "drawer-right"
        ? "items-stretch justify-end"
        : "items-start justify-center pt-10";

  const panelClass =
    variant === "drawer-right"
      ? "animate-slide-in h-full w-full max-w-sm rounded-l-lg"
      : "max-h-[88vh] w-full max-w-lg rounded-lg";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${containerPos} bg-black/30 p-4 backdrop-blur-sm`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex flex-col overflow-hidden border border-gray-200 bg-white shadow-xl ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t bg-gray-50 p-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
