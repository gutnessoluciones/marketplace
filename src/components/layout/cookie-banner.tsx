"use client";

import { useState, useEffect } from "react";

type CookieConsent = {
  necessary: true; // Always on
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_KEY = "flamencalia_cookie_consent";

function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) setVisible(true);
  }, []);

  function save(consent: CookieConsent) {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(consent));
    setVisible(false);
  }

  function acceptAll() {
    save({ necessary: true, analytics: true, marketing: true });
  }

  function rejectAll() {
    save({ necessary: true, analytics: false, marketing: false });
  }

  function saveSelection() {
    save({ necessary: true, analytics, marketing });
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-flamencalia-black flex items-center gap-2">
            🍪 Cookies
          </h3>
          <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
            Usamos cookies esenciales para que el sitio funcione. Puedes elegir
            activar cookies opcionales para mejorar tu experiencia.{" "}
            <a
              href="/legal/cookies"
              className="text-flamencalia-red hover:underline"
            >
              Más info
            </a>
          </p>
        </div>

        {/* Toggles (expandable) */}
        {showDetails && (
          <div className="px-5 pb-3 space-y-3">
            <div className="flex items-center justify-between py-2 border-t border-neutral-100">
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Necesarias
                </p>
                <p className="text-xs text-neutral-400">
                  Autenticación, seguridad, preferencias
                </p>
              </div>
              <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            <label className="flex items-center justify-between py-2 border-t border-neutral-100 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Analíticas
                </p>
                <p className="text-xs text-neutral-400">
                  Nos ayudan a mejorar la web con datos anónimos
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics(!analytics)}
                className={`w-10 h-5 rounded-full relative transition-colors ${analytics ? "bg-flamencalia-red" : "bg-neutral-300"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${analytics ? "right-0.5" : "left-0.5"}`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between py-2 border-t border-neutral-100 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Marketing
                </p>
                <p className="text-xs text-neutral-400">
                  Personalizar productos recomendados
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={marketing}
                onClick={() => setMarketing(!marketing)}
                className={`w-10 h-5 rounded-full relative transition-colors ${marketing ? "bg-flamencalia-red" : "bg-neutral-300"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${marketing ? "right-0.5" : "left-0.5"}`}
                />
              </button>
            </label>
          </div>
        )}

        {/* Buttons */}
        <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
          <button
            onClick={acceptAll}
            className="flex-1 px-4 py-2.5 bg-flamencalia-red text-white text-sm font-medium rounded-xl hover:bg-flamencalia-red/90 transition-colors"
          >
            Aceptar todas
          </button>
          <button
            onClick={rejectAll}
            className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-200 transition-colors"
          >
            Solo necesarias
          </button>
          {!showDetails ? (
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Personalizar
            </button>
          ) : (
            <button
              onClick={saveSelection}
              className="flex-1 px-4 py-2.5 border border-flamencalia-red text-flamencalia-red text-sm font-medium rounded-xl hover:bg-flamencalia-red/5 transition-colors"
            >
              Guardar selección
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
