"use client";

import { useState } from "react";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  onUpdated?: () => void;
}

const NEXT_STATUS: Record<string, { value: string; label: string } | null> = {
  paid: { value: "shipped", label: "Marcar como Enviado" },
  shipped: { value: "delivered", label: "Marcar como Entregado" },
};

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  onUpdated,
}: OrderStatusUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [showTracking, setShowTracking] = useState(false);

  const next = NEXT_STATUS[currentStatus];
  if (!next) return null;

  async function handleUpdate() {
    setLoading(true);
    setError("");

    try {
      const body: Record<string, string> = { status: next!.value };
      if (trackingNumber.trim()) body.tracking_number = trackingNumber.trim();
      if (trackingUrl.trim()) body.tracking_url = trackingUrl.trim();

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.toString() || "Error al actualizar");
        setLoading(false);
        return;
      }

      onUpdated?.();
      window.location.reload();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {currentStatus === "paid" && (
        <>
          {!showTracking ? (
            <button
              type="button"
              onClick={() => setShowTracking(true)}
              className="text-xs text-indigo-600 hover:underline"
            >
              + Añadir número de seguimiento
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Número de seguimiento"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
              />
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="URL de seguimiento (opcional)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
              />
            </div>
          )}
        </>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleUpdate}
        disabled={loading}
        className="w-full bg-linear-to-r from-indigo-600 to-violet-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
      >
        {loading ? "Actualizando..." : next.label}
      </button>
    </div>
  );
}
