"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });

    if (error) {
      setError("No se pudo enviar el email. Inténtalo de nuevo.");
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-bold mb-2 text-flamencalia-black">
          Revisa tu correo
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
          Revisa también la carpeta de spam.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-flamencalia-red hover:text-flamencalia-red-dark transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl font-bold text-center mb-1 text-flamencalia-black">
        Recuperar contraseña
      </h1>
      <p className="text-sm text-neutral-400 text-center mb-6">
        Te enviaremos un enlace para restablecer tu contraseña
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-flamencalia-black/80 mb-1.5"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full border border-flamencalia-albero-pale rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-flamencalia-cream/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-flamencalia-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-neutral-400">
        <Link
          href="/login"
          className="font-medium text-flamencalia-red hover:text-flamencalia-red-dark transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </>
  );
}
