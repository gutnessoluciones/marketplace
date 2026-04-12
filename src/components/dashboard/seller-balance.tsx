"use client";

import { useEffect, useState } from "react";

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

interface BalanceData {
  available: number;
  pending: number;
  connected: boolean;
}

export function SellerBalance() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stripe/balance")
      .then((r) => r.json())
      .then((d) => setBalance(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-flamencalia-albero/15 bg-white p-5">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="mt-3 h-8 w-32 rounded bg-gray-200" />
      </div>
    );
  }

  if (!balance?.connected) return null;

  return (
    <div className="rounded-2xl border border-flamencalia-albero/15 bg-white p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Balance Stripe
      </h3>
      <div className="mt-3 flex items-baseline gap-3">
        <div>
          <p className="text-2xl font-bold text-flamencalia-black">
            {formatPrice(balance.available)}
          </p>
          <p className="text-xs text-green-600">Disponible</p>
        </div>
        {balance.pending > 0 && (
          <div className="border-l border-gray-200 pl-3">
            <p className="text-lg font-semibold text-gray-400">
              {formatPrice(balance.pending)}
            </p>
            <p className="text-xs text-gray-400">Pendiente</p>
          </div>
        )}
      </div>
    </div>
  );
}
