"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";

interface Address {
  id: string;
  label: string | null;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

export function BuyButton({
  productId,
  inStock,
  price = 0,
}: {
  productId: string;
  inStock: boolean;
  price?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponValid, setCouponValid] = useState<{
    coupon_id: string;
    discount: number;
    type: string;
    value: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const router = useRouter();

  async function loadAddresses() {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/addresses");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const list = data.data ?? data;
        setAddresses(list);
        const def = list.find((a: Address) => a.is_default);
        setSelectedId(def?.id ?? list[0]?.id ?? null);
      }
    } catch {
      /* ignore */
    }
    setLoadingAddresses(false);
  }

  function handleBuyClick() {
    setShowAddress(true);
    loadAddresses();
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    setCouponValid(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), order_amount: price }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponValid(data);
      } else {
        setCouponError(data.error ?? "Cupón no válido");
      }
    } catch {
      setCouponError("Error al validar cupón");
    }
    setCheckingCoupon(false);
  }

  async function handleNewAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      full_name: fd.get("full_name"),
      line1: fd.get("line1"),
      line2: fd.get("line2") || undefined,
      city: fd.get("city"),
      state: fd.get("state"),
      postal_code: fd.get("postal_code"),
      country: "ES",
      phone: fd.get("phone") || undefined,
      is_default: addresses.length === 0,
    };
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const addr = await res.json();
      setAddresses((prev) => [...prev, addr]);
      setSelectedId(addr.id);
      setShowNewForm(false);
    }
  }

  async function handleConfirm() {
    const addr = addresses.find((a) => a.id === selectedId);
    if (!addr) return;

    setLoading(true);

    const shippingAddress = {
      full_name: addr.full_name,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      phone: addr.phone,
    };

    // 1. Create order with address
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        shipping_address: shippingAddress,
        coupon_code: couponValid ? couponCode.trim() : undefined,
      }),
    });

    if (!orderRes.ok) {
      const data = await orderRes.json();
      if (orderRes.status === 401) {
        router.push("/login");
        return;
      }
      alert(data.error ?? "Error al crear el pedido");
      setLoading(false);
      return;
    }

    const order = await orderRes.json();

    // 2. Checkout
    const checkoutRes = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });

    if (!checkoutRes.ok) {
      const data = await checkoutRes.json();
      alert(data.error ?? "Error al iniciar el pago");
      setLoading(false);
      return;
    }

    const { url } = await checkoutRes.json();
    if (url) window.location.href = url;
  }

  return (
    <>
      <button
        onClick={handleBuyClick}
        disabled={!inStock || loading}
        className="w-full bg-flamencalia-black text-white py-4 rounded-xl text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-neutral-900/10 hover:shadow-neutral-900/20 hover:scale-[1.01] active:scale-[0.99]"
      >
        {!inStock ? (
          "Sin Stock"
        ) : loading ? (
          "Procesando..."
        ) : (
          <>
            <Icon name="cart" className="w-4 h-4 inline mr-1" /> Comprar Ahora
          </>
        )}
      </button>

      {/* Address selection modal */}
      {showAddress && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAddress(false);
              setShowNewForm(false);
            }}
          />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddress(false);
                setShowNewForm(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
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

            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              Dirección de envío
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              Selecciona dónde quieres recibir tu pedido
            </p>

            {loadingAddresses ? (
              <div className="py-8 text-center text-sm text-neutral-400">
                Cargando direcciones...
              </div>
            ) : (
              <>
                {!showNewForm && (
                  <>
                    {addresses.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {addresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedId === addr.id ? "border-flamencalia-albero bg-flamencalia-albero/5" : "border-neutral-200 hover:border-neutral-300"}`}
                          >
                            <input
                              type="radio"
                              name="address"
                              checked={selectedId === addr.id}
                              onChange={() => setSelectedId(addr.id)}
                              className="mt-1 accent-flamencalia-albero"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-neutral-800">
                                {addr.full_name}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ""}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {addr.postal_code} {addr.city}, {addr.state}
                              </p>
                              {addr.phone && (
                                <p className="text-xs text-neutral-400 mt-0.5">
                                  {addr.phone}
                                </p>
                              )}
                              {addr.is_default && (
                                <span className="inline-block text-[10px] font-medium bg-flamencalia-albero/20 text-flamencalia-albero px-1.5 py-0.5 rounded mt-1">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <Icon
                          name="globe"
                          className="w-8 h-8 text-neutral-200 mx-auto mb-2"
                        />
                        <p className="text-sm text-neutral-400 mb-3">
                          No tienes direcciones guardadas
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => setShowNewForm(true)}
                      className="w-full text-sm font-medium text-flamencalia-albero border border-dashed border-flamencalia-albero/30 py-2.5 rounded-xl hover:bg-flamencalia-albero/5 transition-colors mb-4"
                    >
                      + Añadir nueva dirección
                    </button>
                    {addresses.length > 0 && (
                      <>
                        {/* Coupon */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-neutral-500 mb-1">
                            ¿Tienes un cupón?
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError("");
                                setCouponValid(null);
                              }}
                              placeholder="CÓDIGO"
                              className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm uppercase"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={checkingCoupon || !couponCode.trim()}
                              className="px-3 py-2 rounded-lg bg-neutral-100 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 transition-colors"
                            >
                              {checkingCoupon ? "..." : "Aplicar"}
                            </button>
                          </div>
                          {couponError && (
                            <p className="text-xs text-red-500 mt-1">
                              {couponError}
                            </p>
                          )}
                          {couponValid && (
                            <p className="text-xs text-emerald-600 mt-1 font-medium">
                              ¡Cupón aplicado! Descuento:{" "}
                              {couponValid.type === "percentage"
                                ? `${couponValid.value}%`
                                : `${(couponValid.discount / 100).toFixed(2)} €`}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={handleConfirm}
                          disabled={!selectedId || loading}
                          className="w-full bg-flamencalia-black text-white py-3.5 rounded-xl text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 transition-all"
                        >
                          {loading ? "Procesando..." : "Continuar al pago"}
                        </button>
                      </>
                    )}
                  </>
                )}

                {showNewForm && (
                  <form onSubmit={handleNewAddress} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        name="full_name"
                        required
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">
                        Dirección *
                      </label>
                      <input
                        name="line1"
                        required
                        placeholder="Calle, número, piso..."
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">
                        Dirección (línea 2)
                      </label>
                      <input
                        name="line2"
                        placeholder="Apartamento, portal..."
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1">
                          Ciudad *
                        </label>
                        <input
                          name="city"
                          required
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1">
                          Provincia *
                        </label>
                        <input
                          name="state"
                          required
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1">
                          Código postal *
                        </label>
                        <input
                          name="postal_code"
                          required
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1">
                          Teléfono
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewForm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-flamencalia-black text-white text-sm font-bold hover:bg-neutral-800"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
