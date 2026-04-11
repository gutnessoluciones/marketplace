"use client";

import { useEffect } from "react";

interface AdminToastProps {
  message: string | null;
  type: "success" | "error";
  onClose: () => void;
}

export function AdminToast({ message, type, onClose }: AdminToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          type === "success"
            ? "bg-emerald-600 text-white"
            : "bg-red-600 text-white"
        }`}
      >
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          {type === "success" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          )}
        </svg>
        {message}
      </div>
    </div>
  );
}
