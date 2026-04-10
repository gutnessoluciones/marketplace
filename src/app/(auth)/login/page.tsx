"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [error, setError] = useState(
    urlError === "confirmation"
      ? "El enlace de confirmación ha expirado o no es válido. Regístrate de nuevo."
      : urlError === "auth"
        ? "Error de autenticación. Inténtalo de nuevo."
        : "",
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (error) {
      // Translate common Supabase errors to Spanish
      if (error.message.includes("Email not confirmed")) {
        setError(
          "Tu email no está confirmado. Revisa tu bandeja de entrada o spam.",
        );
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Credenciales incorrectas. Revisa tu email y contraseña.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <>
      <h1 className="font-serif text-2xl font-bold text-center mb-1 text-flamencalia-black">
        Bienvenido de nuevo
      </h1>
      <p className="text-sm text-neutral-400 text-center mb-6">
        Inicia sesión en tu cuenta
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
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className="w-full border border-flamencalia-albero-pale rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-flamencalia-cream/50"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-flamencalia-black/80 mb-1.5"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="w-full border border-flamencalia-albero-pale rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-flamencalia-cream/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-flamencalia-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-neutral-400">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-flamencalia-red hover:text-flamencalia-red-dark transition-colors"
        >
          Regístrate
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
