"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.auth.signUp({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      options: {
        data: {
          display_name: formData.get("display_name") as string,
          role: formData.get("role") as string,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-1">Crear Cuenta</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Únete a nuestro marketplace
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="display_name"
            className="block text-sm font-medium mb-1.5"
          >
            Nombre
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            minLength={2}
            placeholder="Tu nombre"
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1.5"
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
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1.5">
            Quiero...
          </label>
          <select
            id="role"
            name="role"
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
          >
            <option value="buyer">Comprar productos</option>
            <option value="seller">Vender productos</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-black hover:underline">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
