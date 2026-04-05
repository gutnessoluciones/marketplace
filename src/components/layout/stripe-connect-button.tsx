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
      className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "Redirigiendo..." : "Conectar Stripe"}
    </button>
  );
}
