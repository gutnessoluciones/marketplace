"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyButton({
  productId,
  inStock,
}: {
  productId: string;
  inStock: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleBuy() {
    setLoading(true);

    // 1. Create order
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
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

    // 2. Create checkout session
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
    if (url) {
      window.location.href = url;
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={!inStock || loading}
      className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {!inStock ? "Sin Stock" : loading ? "Procesando..." : "Comprar Ahora"}
    </button>
  );
}
