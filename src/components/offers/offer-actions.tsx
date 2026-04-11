"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

interface OfferActionsProps {
  offerId: string;
  amount: number;
  buyerMode?: boolean;
  acceptedMode?: boolean;
}

export function OfferActions({
  offerId,
  amount,
  buyerMode,
  acceptedMode,
}: OfferActionsProps) {
  const [loading, setLoading] = useState("");
  const [response, setResponse] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const router = useRouter();

  async function handleAction(action: "accept" | "reject" | "cancel") {
    setLoading(action);
    try {
      const res = await fetch(`/api/offers/${offerId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: response.trim() || undefined }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Error");
      }
    } catch {
      alert("Error al procesar");
    } finally {
      setLoading("");
    }
  }

  async function handlePay() {
    setLoading("pay");
    try {
      const res = await fetch(`/api/offers/${offerId}`, { method: "POST" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Error al iniciar el pago");
      }
    } catch {
      alert("Error al procesar el pago");
    } finally {
      setLoading("");
    }
  }

  // Buyer with accepted offer — pay button
  if (acceptedMode) {
    return (
      <button
        onClick={handlePay}
        disabled={!!loading}
        className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
      >
        {loading === "pay" ? "Procesando..." : `Pagar ${formatPrice(amount)}`}
      </button>
    );
  }

  // Buyer — can cancel
  if (buyerMode) {
    return (
      <button
        onClick={() => handleAction("cancel")}
        disabled={!!loading}
        className="text-xs font-medium text-neutral-500 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        {loading === "cancel" ? "Cancelando..." : "Cancelar oferta"}
      </button>
    );
  }

  // Seller — accept/reject
  return (
    <div className="space-y-2">
      {showResponse && (
        <input
          type="text"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Mensaje de respuesta (opcional)"
          maxLength={500}
          className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs outline-none focus:border-flamencalia-albero"
        />
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAction("accept")}
          disabled={!!loading}
          className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {loading === "accept" ? "..." : "Aceptar"}
        </button>
        <button
          onClick={() => handleAction("reject")}
          disabled={!!loading}
          className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
        >
          {loading === "reject" ? "..." : "Rechazar"}
        </button>
        <button
          onClick={() => setShowResponse(!showResponse)}
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors ml-auto"
        >
          {showResponse ? "Ocultar" : "Responder"}
        </button>
      </div>
    </div>
  );
}
