"use client";

import { useCart } from "@/components/cart/cart-provider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

export default function CartPage() {
  const { items, sellerGroups, removeItem, clearSeller, clearAll } = useCart();
  const router = useRouter();
  const [loadingSeller, setLoadingSeller] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-flamencalia-black">
          Tu carrito está vacío
        </h2>
        <p className="mt-2 text-sm text-flamencalia-black/50">
          Explora productos y añádelos al carrito
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-flamencalia-albero px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-flamencalia-albero/90"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  const handleBuySeller = async (
    sellerId: string,
    sellerItems: typeof items,
  ) => {
    setLoadingSeller(sellerId);
    try {
      // If single item, use normal flow redirect to product page
      if (sellerItems.length === 1) {
        router.push(`/products/${sellerItems[0].product_id}?buy=true`);
        return;
      }
      // Multi-item: create orders + combined checkout
      const res = await fetch("/api/orders/batch-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: sellerItems.map((i) => ({
            product_id: i.product_id,
            quantity: 1,
          })),
        }),
      });
      const data = await res.json();
      if (data.data?.url) {
        clearSeller(sellerId);
        window.location.href = data.data.url;
      }
    } catch {
      // Handle error silently
    } finally {
      setLoadingSeller(null);
    }
  };

  const groups = Array.from(sellerGroups.entries());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-flamencalia-black">
          Mi Carrito ({items.length})
        </h1>
        <button
          onClick={clearAll}
          className="text-sm text-red-500 hover:underline"
        >
          Vaciar carrito
        </button>
      </div>

      {groups.length > 1 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Tienes productos de {groups.length} vendedores diferentes. Solo puedes
          comprar los artículos de un mismo vendedor a la vez.
        </div>
      )}

      <div className="space-y-6">
        {groups.map(([sellerId, { sellerName, items: sellerItems }]) => {
          const total = sellerItems.reduce((sum, i) => sum + i.price, 0);
          return (
            <div
              key={sellerId}
              className="overflow-hidden rounded-xl border border-flamencalia-albero/15 bg-white"
            >
              {/* Seller header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
                <span className="text-sm font-semibold text-flamencalia-black">
                  {sellerName}
                </span>
                <span className="text-xs text-gray-500">
                  {sellerItems.length}{" "}
                  {sellerItems.length === 1 ? "artículo" : "artículos"}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {sellerItems.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <Link
                      href={`/products/${item.product_id}`}
                      className="shrink-0"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="text-sm font-medium text-flamencalia-black hover:underline line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-0.5 text-sm font-semibold text-flamencalia-albero">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      title="Eliminar"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Seller footer with total + buy */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
                <span className="text-sm text-gray-600">
                  Total:{" "}
                  <strong className="text-flamencalia-black">
                    {formatPrice(total)}
                  </strong>
                </span>
                <button
                  onClick={() => handleBuySeller(sellerId, sellerItems)}
                  disabled={loadingSeller === sellerId}
                  className="rounded-lg bg-flamencalia-albero px-5 py-2 text-sm font-semibold text-white transition hover:bg-flamencalia-albero/90 disabled:opacity-50"
                >
                  {loadingSeller === sellerId
                    ? "Procesando..."
                    : `Comprar ${sellerItems.length === 1 ? "" : `(${sellerItems.length})`}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
