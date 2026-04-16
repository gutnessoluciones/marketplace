"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      if (error.message.includes("same")) {
        setError("La nueva contraseña no puede ser igual a la anterior.");
      } else {
        setError("No se pudo actualizar la contraseña. Inténtalo de nuevo.");
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    }
  }

  if (success) {
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-bold mb-2 text-flamencalia-black">
          Contraseña actualizada
        </h1>
        <p className="text-sm text-neutral-500">Redirigiendo al panel...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl font-bold text-center mb-1 text-flamencalia-black">
        Nueva contraseña
      </h1>
      <p className="text-sm text-neutral-400 text-center mb-6">
        Escribe tu nueva contraseña
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-flamencalia-black/80 mb-1.5"
          >
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-flamencalia-albero-pale rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-flamencalia-cream/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-flamencalia-black/40 hover:text-flamencalia-black/70 transition-colors"
              tabIndex={-1}
            >
              <Icon
                name={showPassword ? "eyeOff" : "eye"}
                className="w-4.5 h-4.5"
              />
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-flamencalia-black/80 mb-1.5"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            className="w-full border border-flamencalia-albero-pale rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-flamencalia-cream/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-flamencalia-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? "Actualizando..." : "Guardar nueva contraseña"}
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
