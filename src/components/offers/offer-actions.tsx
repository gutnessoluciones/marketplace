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
  originalPrice?: number;
  counterAmount?: number;
  offerStatus?: string;
  buyerMode?: boolean;
  acceptedMode?: boolean;
}

export function OfferActions({
  offerId,
  amount,
  originalPrice,
  counterAmount,
  offerStatus,
  buyerMode,
  acceptedMode,
}: OfferActionsProps) {
  const [loading, setLoading] = useState("");
  const [response, setResponse] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [counterValue, setCounterValue] = useState("");
  const router = useRouter();

  async function handleAction(action: string) {
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

  // Buyer — can cancel or respond to counter
  if (buyerMode) {
    if (offerStatus === "countered" && counterAmount) {
      return (
        <div className="space-y-2">
          <p className="text-xs text-blue-600 font-medium">
            Contraoferta: {formatPrice(counterAmount)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction("accept-counter")}
              disabled={!!loading}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading === "accept-counter" ? "..." : "Aceptar contraoferta"}
            </button>
            <button
              onClick={() => handleAction("reject-counter")}
              disabled={!!loading}
              className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
            >
              {loading === "reject-counter" ? "..." : "Rechazar"}
            </button>
          </div>
        </div>
      );
    }
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

  // Seller — accept/reject/counter
  async function handleCounter() {
    const cents = Math.round(parseFloat(counterValue) * 100);
    if (isNaN(cents) || cents <= amount) {
      alert("La contraoferta debe ser mayor a la oferta del comprador");
      return;
    }
    if (originalPrice && cents >= originalPrice) {
      alert("La contraoferta debe ser menor al precio original");
      return;
    }
    setLoading("counter");
    try {
      const res = await fetch(`/api/offers/${offerId}/counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counter_amount: cents,
          response: response.trim() || undefined,
        }),
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
      {showCounter && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
              €
            </span>
            <input
              type="number"
              step="0.01"
              value={counterValue}
              onChange={(e) => setCounterValue(e.target.value)}
              placeholder={(amount / 100 + 5).toFixed(2)}
              className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-blue-200 text-xs outline-none focus:border-blue-400"
            />
          </div>
          <button
            onClick={handleCounter}
            disabled={!!loading || !counterValue}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading === "counter" ? "..." : "Enviar"}
          </button>
        </div>
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
          onClick={() => {
            setShowCounter(!showCounter);
            setShowResponse(false);
          }}
          disabled={!!loading}
          className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all disabled:opacity-50"
        >
          Contraoferta
        </button>
        <button
          onClick={() => handleAction("reject")}
          disabled={!!loading}
          className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
        >
          {loading === "reject" ? "..." : "Rechazar"}
        </button>
        <button
          onClick={() => {
            setShowResponse(!showResponse);
            setShowCounter(false);
          }}
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors ml-auto"
        >
          {showResponse ? "Ocultar" : "Mensaje"}
        </button>
      </div>
    </div>
  );
}
