"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

const BOOST_OPTIONS = [
  {
    type: "featured",
    label: "Destacado",
    desc: "7 días en posición premium",
    icon: "star",
  },
  {
    type: "top",
    label: "Top",
    desc: "3 días en las primeras posiciones",
    icon: "arrowUp",
  },
  {
    type: "highlight",
    label: "Resaltar",
    desc: "1 día con borde dorado",
    icon: "sparkle",
  },
] as const;

export function BoostButton({ productId }: { productId: string }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleBoost(type: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/boosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, boost_type: type }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setShow(false);
          setSuccess(false);
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al activar boost");
      }
    } catch {
      setError("Error de conexión");
    }
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="text-xs font-medium text-flamencalia-albero hover:text-flamencalia-albero-dark transition-colors flex items-center gap-1"
      >
        <Icon name="sparkle" className="w-3.5 h-3.5" />
        Destacar
      </button>

      {show && (
        <div className="absolute right-0 top-full mt-1 z-20 w-60 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 space-y-2">
          {success ? (
            <div className="text-center py-3">
              <Icon
                name="checkCircle"
                className="w-6 h-6 text-emerald-500 mx-auto mb-1"
              />
              <p className="text-sm font-medium text-emerald-700">
                ¡Boost activado!
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-neutral-700 mb-2">
                Destacar producto
              </p>
              {BOOST_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleBoost(opt.type)}
                  disabled={loading}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-flamencalia-albero/5 transition-colors text-left disabled:opacity-50"
                >
                  <Icon
                    name={opt.icon}
                    className="w-4 h-4 text-flamencalia-albero shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-neutral-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
              {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
