"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

const REASONS = [
  { value: "item_not_received", label: "No he recibido el artículo" },
  {
    value: "item_not_as_described",
    label: "El artículo no es como se describió",
  },
  { value: "damaged", label: "Artículo dañado" },
  { value: "counterfeit", label: "Artículo falsificado" },
  { value: "other", label: "Otro motivo" },
];

export function DisputeButton({ orderId }: { orderId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason || description.length < 10) {
      setError(
        "Selecciona un motivo y describe el problema (mín. 10 caracteres)",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, reason, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al crear la disputa");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full text-xs font-medium text-neutral-400 hover:text-red-500 transition-colors py-2"
      >
        <Icon name="alertTriangle" className="w-3.5 h-3.5 inline mr-1" />
        ¿Hay algún problema? Abrir disputa
      </button>
    );
  }

  return (
    <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-red-700 mb-3">Abrir disputa</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm"
        >
          <option value="">Selecciona el motivo...</option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el problema con detalle..."
          rows={3}
          maxLength={2000}
          className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm resize-none"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar disputa"}
          </button>
        </div>
      </form>
    </div>
  );
}
