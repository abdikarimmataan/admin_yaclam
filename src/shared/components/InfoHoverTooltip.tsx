"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

type InfoHoverTooltipProps = {
  content: string;
  tone?: "default" | "danger";
};

export function InfoHoverTooltip({ content, tone = "default" }: InfoHoverTooltipProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const show = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
    setOpen(true);
  };

  const hide = () => setOpen(false);

  const iconClass =
    tone === "danger"
      ? "border-red-300 text-red-500 hover:border-red-400 hover:text-red-600"
      : "border-slate-400 text-slate-500 hover:border-slate-600 hover:text-slate-700";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="More information"
        className={`inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${iconClass}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <HelpCircle className="h-3 w-3" strokeWidth={2.25} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              transform: "translateX(-50%)",
              zIndex: 9999,
            }}
            className="pointer-events-none w-56 rounded-xl bg-white px-3.5 py-2.5 text-xs leading-relaxed text-slate-700 shadow-lg ring-1 ring-slate-200/80"
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
