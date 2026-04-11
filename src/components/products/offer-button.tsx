"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

interface OfferButtonProps {
  productId: string;
  sellerId: string;
  currentPrice: number; // cents
  condition: string;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function OfferButton({
  productId,
  sellerId,
  currentPrice,
  condition,
}: OfferButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeOffer, setActiveOffer] = useState<{
    id: string;
    amount: number;
    status: string;
    expires_at: string;
    counter_amount?: number;
    counter_expires_at?: string;
  } | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const minOffer = Math.ceil(currentPrice * 0.2); // 20% minimum
  const maxOffer = currentPrice - 1;

  // Check for active offer on mount
  useEffect(() => {
    fetch(`/api/offers/${productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.offer) setActiveOffer(d.offer);
      })
      .catch(() => {});
  }, [productId]);

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  const suggestions = [
    Math.round(currentPrice * 0.5),
    Math.round(currentPrice * 0.7),
    Math.round(currentPrice * 0.85),
  ].filter((s) => s >= minOffer && s <= maxOffer);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents < minOffer) {
      setError(`La oferta mínima es ${formatPrice(minOffer)}`);
      return;
    }
    if (amountCents >= currentPrice) {
      setError("La oferta debe ser menor al precio del producto");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          amount: amountCents,
          message: message.trim() || undefined,
        }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al enviar la oferta");
        return;
      }

      setActiveOffer(data);
      setShowModal(false);
      setAmount("");
      setMessage("");
    } catch {
      setError("Error al enviar la oferta");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!activeOffer) return;
    setLoading(true);
    try {
      await fetch(`/api/offers/${activeOffer.id}/cancel`, { method: "POST" });
      setActiveOffer(null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    if (!activeOffer) return;
    setPayLoading(true);
    try {
      const res = await fetch(`/api/offers/${activeOffer.id}`, {
        method: "POST",
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Error al iniciar el pago");
      }
    } catch {
      setError("Error al procesar el pago");
    } finally {
      setPayLoading(false);
    }
  }

  const discount = Math.round(
    (1 - (activeOffer?.amount ?? 0) / currentPrice) * 100,
  );

  // Active offer states
  if (activeOffer) {
    if (activeOffer.status === "pending") {
      const expiresIn = Math.max(
        0,
        Math.round(
          (new Date(activeOffer.expires_at).getTime() - Date.now()) / 3600000,
        ),
      );
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Icon name="clock" className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Oferta pendiente
              </p>
              <p className="text-xs text-amber-600">Expira en {expiresIn}h</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-amber-800">
                {formatPrice(activeOffer.amount)}
              </span>
              <span className="text-xs text-amber-600 ml-1.5">
                (-{discount}%)
              </span>
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-xs font-medium text-amber-700 hover:text-amber-900 underline disabled:opacity-50"
            >
              {loading ? "Cancelando..." : "Cancelar oferta"}
            </button>
          </div>
        </div>
      );
    }

    if (activeOffer.status === "countered" && activeOffer.counter_amount) {
      const counterDiscount = Math.round(
        (1 - activeOffer.counter_amount / currentPrice) * 100,
      );
      const counterExpiresIn = activeOffer.counter_expires_at
        ? Math.max(
            0,
            Math.round(
              (new Date(activeOffer.counter_expires_at).getTime() -
                Date.now()) /
                3600000,
            ),
          )
        : 0;

      async function handleAcceptCounter() {
        if (!activeOffer) return;
        setLoading(true);
        try {
          const res = await fetch(
            `/api/offers/${activeOffer.id}/accept-counter`,
            { method: "POST" },
          );
          if (res.ok) {
            const data = await res.json();
            setActiveOffer({
              ...activeOffer,
              status: "accepted",
              amount: data.amount ?? activeOffer.counter_amount,
            });
          }
        } catch {
          /* ignore */
        }
        setLoading(false);
      }

      async function handleRejectCounter() {
        if (!activeOffer) return;
        setLoading(true);
        try {
          await fetch(`/api/offers/${activeOffer.id}/reject-counter`, {
            method: "POST",
          });
          setActiveOffer(null);
        } catch {
          /* ignore */
        }
        setLoading(false);
      }

      return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Contraoferta del vendedor
              </p>
              <p className="text-xs text-blue-600">
                Expira en {counterExpiresIn}h
              </p>
            </div>
          </div>
          <div className="mb-3">
            <span className="text-xs text-neutral-400 line-through mr-2">
              Tu oferta: {formatPrice(activeOffer.amount)}
            </span>
            <span className="text-lg font-bold text-blue-800">
              {formatPrice(activeOffer.counter_amount!)}
            </span>
            <span className="text-xs text-blue-600 ml-1.5">
              (-{counterDiscount}%)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptCounter}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {loading ? "..." : "Aceptar"}
            </button>
            <button
              onClick={handleRejectCounter}
              disabled={loading}
              className="flex-1 border border-blue-200 text-blue-700 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-all"
            >
              {loading ? "..." : "Rechazar"}
            </button>
          </div>
        </div>
      );
    }

    if (activeOffer.status === "accepted") {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Icon name="check" className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                ¡Oferta aceptada!
              </p>
              <p className="text-xs text-emerald-600">
                Procede al pago para completar la compra
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-lg font-bold text-emerald-800">
                {formatPrice(activeOffer.amount)}
              </span>
              <span className="text-xs line-through text-neutral-400 ml-2">
                {formatPrice(currentPrice)}
              </span>
            </div>
            <button
              onClick={handlePay}
              disabled={payLoading}
              className="ml-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {payLoading
                ? "Procesando..."
                : `Pagar ${formatPrice(activeOffer.amount)}`}
            </button>
          </div>
        </div>
      );
    }
  }

  // Main button
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold px-5 py-3.5 rounded-xl border-2 border-flamencalia-albero text-flamencalia-albero hover:bg-flamencalia-albero hover:text-white transition-all"
      >
        <Icon name="tag" className="w-4.5 h-4.5" />
        Hacer oferta
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-5">
              <h3 className="text-lg font-bold text-neutral-900">
                Hacer una oferta
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Precio actual:{" "}
                <span className="font-semibold text-neutral-700">
                  {formatPrice(currentPrice)}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                  Tu oferta
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
                    €
                  </span>
                  <input
                    ref={inputRef}
                    type="number"
                    step="0.01"
                    min={(minOffer / 100).toFixed(2)}
                    max={(maxOffer / 100).toFixed(2)}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError("");
                    }}
                    placeholder={(Math.round(currentPrice * 0.7) / 100).toFixed(
                      2,
                    )}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-flamencalia-albero focus:ring-2 focus:ring-flamencalia-albero/20 text-lg font-bold text-neutral-800 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Mínimo: {formatPrice(minOffer)} · Máximo:{" "}
                  {formatPrice(maxOffer)}
                </p>
              </div>

              {/* Quick suggestions */}
              <div className="flex gap-2">
                {suggestions.map((s) => {
                  const pct = Math.round((1 - s / currentPrice) * 100);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setAmount((s / 100).toFixed(2));
                        setError("");
                      }}
                      className={`flex-1 py-2 px-2 rounded-lg text-center border transition-all ${
                        Math.round(parseFloat(amount) * 100) === s
                          ? "border-flamencalia-albero bg-flamencalia-albero/10 text-flamencalia-albero"
                          : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                      }`}
                    >
                      <span className="text-sm font-bold block">
                        {formatPrice(s)}
                      </span>
                      <span className="text-[10px]">-{pct}%</span>
                    </button>
                  );
                })}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ej: Estoy muy interesada, ¿aceptarías este precio?"
                  maxLength={500}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-flamencalia-albero focus:ring-2 focus:ring-flamencalia-albero/20 text-sm text-neutral-700 outline-none transition-all resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Discount preview */}
              {amount && parseFloat(amount) > 0 && (
                <div className="bg-flamencalia-albero/5 border border-flamencalia-albero/20 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Descuento</span>
                  <span className="text-sm font-bold text-flamencalia-albero">
                    -
                    {Math.round(
                      (1 - (parseFloat(amount) * 100) / currentPrice) * 100,
                    )}
                    %
                    <span className="font-normal text-neutral-400 ml-1.5">
                      (ahorras{" "}
                      {formatPrice(
                        currentPrice - Math.round(parseFloat(amount) * 100),
                      )}
                      )
                    </span>
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full bg-flamencalia-black text-white py-3.5 rounded-xl text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? "Enviando..." : "Enviar oferta"}
              </button>

              <p className="text-[10px] text-center text-neutral-400">
                El vendedor tiene 48 horas para responder
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
