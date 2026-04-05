"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password: formData.get("password") as string,
      options: {
        data: {
          display_name: formData.get("display_name") as string,
          role: formData.get("role") as string,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      setError("Ya existe una cuenta con este correo electrónico.");
      setLoading(false);
    } else if (data.session) {
      // Email confirmation disabled in Supabase → direct login
      router.push("/dashboard");
      router.refresh();
    } else {
      // Email confirmation required
      setEmailSent(email);
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="check" className="w-8 h-8 text-teal-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Revisa tu correo
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          Hemos enviado un enlace de confirmación a{" "}
          <span className="font-semibold text-slate-700">{emailSent}</span>
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Haz clic en el enlace del correo para activar tu cuenta y empezar a
          usar GutnesPlace.
        </p>
        <button
          onClick={() => setEmailSent("")}
          className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
        >
          ← Volver al registro
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-1 text-slate-800">
        Crear Cuenta
      </h1>
      <p className="text-sm text-slate-400 text-center mb-6">
        Únete a GutnesPlace
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="display_name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nombre
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            minLength={2}
            placeholder="Tu nombre"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-slate-50/50"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-slate-50/50"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1.5"
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
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-slate-50/50"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Quiero...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="relative">
              <input
                type="radio"
                name="role"
                value="buyer"
                defaultChecked
                className="peer sr-only"
              />
              <div className="border-2 border-slate-200 rounded-xl p-3 text-center cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition-all hover:border-slate-300">
                <span className="text-xl block mb-1 text-slate-400">
                  <Icon name="cart" className="w-5 h-5 mx-auto" />
                </span>
                <span className="text-xs font-semibold text-slate-600 peer-checked:text-indigo-700">
                  Comprar
                </span>
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                name="role"
                value="seller"
                className="peer sr-only"
              />
              <div className="border-2 border-slate-200 rounded-xl p-3 text-center cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition-all hover:border-slate-300">
                <span className="text-xl block mb-1 text-slate-400">
                  <Icon name="store" className="w-5 h-5 mx-auto" />
                </span>
                <span className="text-xs font-semibold text-slate-600 peer-checked:text-indigo-700">
                  Vender
                </span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-indigo-600 to-violet-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-slate-400">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
