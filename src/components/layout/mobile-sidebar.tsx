"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { SignOutButton } from "@/components/layout/sign-out-button";

interface MobileSidebarProps {
  navItems: { href: string; label: string; icon: string }[];
  displayName: string;
  isSeller: boolean;
}

export function MobileSidebar({
  navItems,
  displayName,
  isSeller,
}: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-flamencalia-black h-14 flex items-center justify-between px-4">
        <button onClick={() => setOpen(true)} className="text-white p-1.5">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/cliente/flamencalia.jpg"
            alt="Flamencalia"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-white font-serif text-sm tracking-wide">
            FLAMENCALIA
          </span>
        </Link>
        <div className="w-9 h-9 rounded-full bg-flamencalia-albero flex items-center justify-center text-flamencalia-black font-bold text-xs">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-linear-to-b from-flamencalia-black to-flamencalia-red-dark p-5 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/cliente/flamencalia.jpg"
                  alt="Flamencalia"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-white font-serif text-sm tracking-wide">
                  FLAMENCALIA
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white p-1"
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

            <nav className="space-y-1 flex-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-white/15 text-white" : "text-flamencalia-albero-pale hover:bg-white/10 hover:text-white"}`}
                  >
                    <Icon name={item.icon} className="w-4.5 h-4.5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-white/10">
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-flamencalia-albero/50 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Icon name="store" className="w-4.5 h-4.5" />
                  Ver tienda
                </Link>
              </div>
            </nav>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 px-1 mb-3">
                <div className="w-9 h-9 rounded-full bg-flamencalia-albero flex items-center justify-center text-flamencalia-black font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-flamencalia-albero/60">
                    {isSeller ? "Proveedor" : "Cliente"}
                  </p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
