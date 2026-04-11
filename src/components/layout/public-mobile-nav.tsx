"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";

const CATEGORIES = [
  { slug: "feria", label: "Feria", icon: "fan" },
  { slug: "camino", label: "Camino", icon: "flower" },
  { slug: "complementos-flamencos", label: "Complementos", icon: "earring" },
  { slug: "invitada-flamenca", label: "Invitada Flamenca", icon: "dress" },
  { slug: "moda-infantil", label: "Moda Infantil", icon: "child" },
  { slug: "equitacion", label: "Equitación", icon: "horseshoe" },
  { slug: "zapatos", label: "Zapatos", icon: "shoe" },
];

const NAV_LINKS = [
  { href: "/products", label: "Todos los productos", icon: "store" },
  { href: "/about", label: "Quiénes Somos", icon: "heart" },
  { href: "/blog", label: "Blog", icon: "book" },
  { href: "/ferias", label: "Ferias", icon: "mapPin" },
];

export function PublicMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden p-2 text-flamencalia-black/60 hover:text-flamencalia-red transition-colors"
        aria-label="Abrir menú"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Full-screen overlay menu */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-flamencalia-cream flex flex-col animate-in slide-in-from-left duration-200 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-flamencalia-albero-pale/30">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/cliente/marca-flamencalia.svg"
                  alt="FLAMENCALIA"
                  width={140}
                  height={28}
                  className="h-6 w-auto"
                />
                <Image
                  src="/cliente/Abanico.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-flamencalia-black/40 hover:text-flamencalia-black"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-flamencalia-albero-pale/20">
              <form action="/products" method="GET">
                <div className="relative">
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-flamencalia-albero"
                  />
                  <input
                    type="text"
                    name="q"
                    placeholder="Buscar..."
                    className="w-full bg-white border border-flamencalia-albero-pale rounded-xl pl-9 pr-4 py-2.5 text-sm text-flamencalia-black placeholder-neutral-400 focus:border-flamencalia-albero focus:outline-none focus:ring-2 focus:ring-flamencalia-albero/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setOpen(false);
                    }}
                  />
                </div>
              </form>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Navigation links */}
              <div className="px-3 py-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-flamencalia-black/70 hover:bg-flamencalia-albero-pale/20 hover:text-flamencalia-red transition-colors"
                  >
                    <Icon
                      name={link.icon}
                      className="w-4.5 h-4.5 text-flamencalia-albero"
                    />
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Categories */}
              <div className="border-t border-flamencalia-albero-pale/20">
                <p className="px-6 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-flamencalia-albero">
                  Categorías
                </p>
                <div className="px-3 py-2">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-flamencalia-black/60 hover:bg-flamencalia-albero-pale/20 hover:text-flamencalia-red transition-colors"
                    >
                      <Icon
                        name={cat.icon}
                        className="w-4 h-4 text-flamencalia-albero/70"
                      />
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer auth links */}
            <div className="border-t border-flamencalia-albero-pale/30 px-4 py-4 space-y-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-flamencalia-red border-2 border-flamencalia-red rounded-xl hover:bg-flamencalia-red hover:text-white transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-white bg-flamencalia-black rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
