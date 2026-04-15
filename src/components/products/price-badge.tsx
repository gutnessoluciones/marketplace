"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

interface PriceHistoryEntry {
  old_price: number;
  new_price: number;
  changed_at: string;
}

interface PriceBadgeProps {
  currentPrice: number;
  history: PriceHistoryEntry[];
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function PriceBadge({ currentPrice, history }: PriceBadgeProps) {
  const [showHistory, setShowHistory] = useState(false);

  if (!history || history.length === 0) return null;

  const lastChange = history[0];
  const priceDrop = lastChange.old_price > currentPrice;
  const dropPercent = priceDrop
    ? Math.round(
        ((lastChange.old_price - currentPrice) / lastChange.old_price) * 100,
      )
    : 0;

  if (!priceDrop) return null;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowHistory(!showHistory)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
      >
        <Icon name="trendingDown" className="w-3 h-3" />-{dropPercent}% rebajado
      </button>

      {showHistory && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowHistory(false)}
          />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-neutral-200 rounded-xl shadow-lg p-3 min-w-50">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Historial de precio
            </p>
            <div className="space-y-1.5">
              {history.slice(0, 5).map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-neutral-400">
                    {new Date(entry.changed_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400 line-through">
                      {formatPrice(entry.old_price)}
                    </span>
                    <span className="text-neutral-300">→</span>
                    <span
                      className={
                        entry.new_price < entry.old_price
                          ? "text-emerald-600 font-medium"
                          : "text-red-500 font-medium"
                      }
                    >
                      {formatPrice(entry.new_price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100">
              Precio antes: {formatPrice(lastChange.old_price)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
