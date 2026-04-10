"use client";

import { useState } from "react";

export function StripeConnectButton() {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    const res = await fetch("/api/stripe/connect", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "Error al iniciar el proceso de Stripe");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="bg-flamencalia-red text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
      {loading ? "Redirigiendo a Stripe..." : "Conectar con Stripe"}
    </button>
  );
}
