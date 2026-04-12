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
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [showTracking, setShowTracking] = useState(false);

  const next = NEXT_STATUS[currentStatus];
  if (!next) return null;

  const CARRIERS = [
    { value: "", label: "Seleccionar transportista" },
    { value: "correos", label: "Correos" },
    { value: "seur", label: "SEUR" },
    { value: "mrw", label: "MRW" },
    { value: "gls", label: "GLS" },
    { value: "ups", label: "UPS" },
    { value: "dhl", label: "DHL" },
    { value: "fedex", label: "FedEx" },
    { value: "nacex", label: "Nacex" },
    { value: "otro", label: "Otro" },
  ];

  async function handleUpdate() {
    setLoading(true);
    setError("");

    try {
      const body: Record<string, string> = { status: next!.value };
      if (trackingNumber.trim()) body.tracking_number = trackingNumber.trim();
      if (trackingUrl.trim()) body.tracking_url = trackingUrl.trim();
      if (trackingCarrier) body.tracking_carrier = trackingCarrier;

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
              className="text-xs text-flamencalia-red hover:underline"
            >
              + Añadir número de seguimiento
            </button>
          ) : (
            <div className="space-y-2">
              <select
                value={trackingCarrier}
                onChange={(e) => setTrackingCarrier(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red bg-neutral-50/50"
              >
                {CARRIERS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Número de seguimiento"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red bg-neutral-50/50"
              />
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="URL de seguimiento (opcional)"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red bg-neutral-50/50"
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
        className="w-full bg-flamencalia-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all"
      >
        {loading ? "Actualizando..." : next.label}
      </button>
    </div>
  );
}
