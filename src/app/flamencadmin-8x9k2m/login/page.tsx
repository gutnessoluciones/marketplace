"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";

const ADMIN_BASE = "/flamencadmin-8x9k2m";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      if (error.message.includes("Invalid login credentials")) {
        setError("Credenciales incorrectas.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push(ADMIN_BASE);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-flamencalia-black via-neutral-900 to-flamencalia-red-dark p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-flamencalia-red/20 mb-4">
            <Icon name="fan" className="w-8 h-8 text-flamencalia-red-light" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">
            Admin Flamencalia
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Panel de administración
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 text-red-300 text-sm p-3 rounded-xl mb-4 border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-300 mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@flamencalia.es"
                className="w-full border border-white/10 bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-flamencalia-red/40 focus:border-flamencalia-red/40 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-300 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full border border-white/10 bg-white/5 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-flamencalia-red/40 focus:border-flamencalia-red/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  tabIndex={-1}
                >
                  <Icon
                    name={showPassword ? "eyeOff" : "eye"}
                    className="w-4.5 h-4.5"
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-flamencalia-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all shadow-lg shadow-flamencalia-red/20 cursor-pointer"
            >
              {loading ? "Verificando..." : "Acceder al panel"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">
          Acceso restringido a administradores
        </p>
      </div>
    </div>
  );
}
