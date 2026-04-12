"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

const REFUND_REASONS = [
  { value: "no_recibido", label: "No he recibido el producto" },
  { value: "defectuoso", label: "El producto está defectuoso" },
  { value: "no_corresponde", label: "No corresponde con la descripción" },
  { value: "talla_incorrecta", label: "Talla incorrecta" },
  { value: "cambio_opinion", label: "He cambiado de opinión" },
  { value: "otro", label: "Otro motivo" },
];

interface RefundRequestProps {
  orderId: string;
  orderStatus: string;
}

export function RefundRequest({ orderId, orderStatus }: RefundRequestProps) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!["paid", "shipped"].includes(orderStatus)) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason:
            `${REFUND_REASONS.find((r) => r.value === reason)?.label}: ${details}`.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error?.toString() || "Error al solicitar reembolso");
        setResult("error");
      } else {
        setResult("success");
      }
    } catch {
      setErrorMsg("Error de conexión");
      setResult("error");
    } finally {
      setLoading(false);
    }
  }

  if (result === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
        <Icon
          name="checkCircle"
          className="w-6 h-6 text-emerald-600 mx-auto mb-2"
        />
        <p className="text-sm font-medium text-emerald-700">
          Reembolso procesado correctamente
        </p>
        <p className="text-xs text-emerald-600 mt-1">
          El importe se devolverá a tu método de pago en 5-10 días hábiles.
        </p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
      >
        <Icon name="undo" className="w-4 h-4" />
        Solicitar devolución
      </button>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">
        Solicitar devolución
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-neutral-500 font-medium">
            Motivo de la devolución
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red bg-neutral-50/50"
          >
            <option value="">Seleccionar motivo...</option>
            {REFUND_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-neutral-500 font-medium">
            Detalles adicionales (opcional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Describe el problema brevemente..."
            className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red bg-neutral-50/50 resize-none"
          />
        </div>

        {result === "error" && (
          <p className="text-xs text-red-500">{errorMsg}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 py-2 rounded-xl text-sm font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !reason}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-flamencalia-red hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all"
          >
            {loading ? "Procesando..." : "Confirmar devolución"}
          </button>
        </div>
      </form>

      <p className="text-[10px] text-neutral-400 mt-3 text-center">
        El reembolso se procesará automáticamente a tu método de pago original.
      </p>
    </div>
  );
}
