"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/icons";

export function MobileSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <>
      {/* Magnifying glass button — visible only on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden p-2 text-flamencalia-black/60 hover:text-flamencalia-red transition-colors"
        aria-label="Buscar"
      >
        <Icon name="search" className="w-5 h-5" />
      </button>

      {/* Search overlay */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-flamencalia-white shadow-lg animate-in slide-in-from-top duration-200">
            <form
              action="/products"
              method="GET"
              className="flex items-center gap-2 px-4 py-3"
              onSubmit={() => setOpen(false)}
            >
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-flamencalia-albero"
                />
                <input
                  ref={inputRef}
                  type="text"
                  name="q"
                  placeholder="Buscar vestidos, mantones, complementos..."
                  className="w-full bg-flamencalia-cream border border-flamencalia-albero-pale rounded-full pl-10 pr-4 py-3 text-sm text-flamencalia-black placeholder-neutral-400 focus:border-flamencalia-albero focus:outline-none focus:ring-2 focus:ring-flamencalia-albero/20"
                />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-flamencalia-black/40 hover:text-flamencalia-black transition-colors"
                aria-label="Cerrar búsqueda"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
