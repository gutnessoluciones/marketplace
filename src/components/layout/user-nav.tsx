"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

interface UserProfile {
  display_name: string;
  avatar_url: string | null;
}

export function UserNav({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(
    null,
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", data.user.id)
          .single();
        if (prof) setProfile(prof);
      }
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
              ? "text-flamencalia-albero-pale text-xs sm:text-sm hover:text-white transition-colors"
              : "text-flamencalia-black/70 text-xs sm:text-sm hover:text-flamencalia-red transition-colors"
          }
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="hidden sm:inline-flex text-xs bg-flamencalia-red text-white px-4 py-1.5 rounded-full font-bold hover:bg-flamencalia-red-dark transition-colors"
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
            ? "text-flamencalia-albero-pale hover:bg-white/10 hover:text-white"
            : "text-flamencalia-black/70 hover:bg-flamencalia-albero-pale/50 hover:text-flamencalia-red"
        }`}
      >
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name || "Avatar"}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              isDark
                ? "bg-flamencalia-albero text-flamencalia-black"
                : "bg-flamencalia-red/10 text-flamencalia-red"
            }`}
          >
            {(profile?.display_name || user.email || "?")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline max-w-28 truncate">
          {profile?.display_name || user.email?.split("@")[0]}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-flamencalia-white rounded-xl shadow-lg border border-flamencalia-albero-pale/50 py-1.5 z-50">
            <Link
              href={`/sellers/${user?.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-flamencalia-black/70 hover:bg-flamencalia-albero-pale/30 hover:text-flamencalia-red transition-colors"
            >
              <Icon name="user" className="w-4 h-4 text-flamencalia-albero" />
              Ver mi perfil
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-flamencalia-black/70 hover:bg-flamencalia-albero-pale/30 hover:text-flamencalia-red transition-colors"
            >
              <Icon name="chart" className="w-4 h-4 text-flamencalia-albero" />
              Mi Panel
            </Link>
            <Link
              href="/dashboard/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-flamencalia-black/70 hover:bg-flamencalia-albero-pale/30 hover:text-flamencalia-red transition-colors"
            >
              <Icon
                name="receipt"
                className="w-4 h-4 text-flamencalia-albero"
              />
              Mis Pedidos
            </Link>
            <Link
              href="/dashboard/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-flamencalia-black/70 hover:bg-flamencalia-albero-pale/30 hover:text-flamencalia-red transition-colors"
            >
              <Icon name="heart" className="w-4 h-4 text-flamencalia-albero" />
              Mis Favoritos
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-flamencalia-black/70 hover:bg-flamencalia-albero-pale/30 hover:text-flamencalia-red transition-colors"
            >
              <Icon name="gear" className="w-4 h-4 text-flamencalia-albero" />
              Configuración
            </Link>
            <div className="border-t border-flamencalia-albero-pale/50 my-1" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-flamencalia-red hover:bg-flamencalia-red/5 transition-colors w-full"
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
