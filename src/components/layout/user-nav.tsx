"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

export function UserNav({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <div className="w-20 h-8" />;
  }

  if (!user) {
    const isDark = variant === "dark";
    return (
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/login"
          className={
            isDark
              ? "text-indigo-200 text-xs sm:text-sm hover:text-white transition-colors"
              : "text-slate-600 text-xs sm:text-sm hover:text-slate-900 transition-colors"
          }
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="hidden sm:inline-flex text-xs bg-teal-400 text-indigo-950 px-4 py-1.5 rounded-full font-bold hover:bg-teal-300 transition-colors"
        >
          Registrarse
        </Link>
      </div>
    );
  }

  const isDark = variant === "dark";
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 text-sm font-medium rounded-full px-3 py-1.5 transition-colors ${
          isDark
            ? "text-indigo-200 hover:bg-white/10 hover:text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            isDark
              ? "bg-teal-400 text-indigo-950"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline max-w-24 truncate">
          {user.email?.split("@")[0]}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Icon name="chart" className="w-4 h-4 text-slate-400" />
              Mi Panel
            </Link>
            <Link
              href="/dashboard/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Icon name="receipt" className="w-4 h-4 text-slate-400" />
              Mis Pedidos
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Icon name="gear" className="w-4 h-4 text-slate-400" />
              Configuración
            </Link>
            <div className="border-t border-slate-100 my-1" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
