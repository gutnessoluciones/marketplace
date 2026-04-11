"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { SignOutButton } from "@/components/layout/sign-out-button";

interface AdminMobileSidebarProps {
  navItems: { href: string; label: string; icon: string }[];
  ownerNavItems?: { href: string; label: string; icon: string }[];
  displayName: string;
  role: string;
}

export function AdminMobileSidebar({
  navItems,
  ownerNavItems,
  displayName,
  role,
}: AdminMobileSidebarProps) {
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
        <Link href="/flamencadmin-8x9k2m" className="flex items-center gap-2">
          <Image
            src="/cliente/Abanico.svg"
            alt="Flamencalia"
            width={24}
            height={24}
            className="drop-shadow-md"
          />
          <span className="text-white font-serif text-sm tracking-wide">
            Admin
          </span>
        </Link>
        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
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
                href="/flamencadmin-8x9k2m"
                className="flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/cliente/Abanico.svg"
                  alt="Flamencalia"
                  width={28}
                  height={28}
                  className="drop-shadow-md"
                />
                <span className="text-white font-bold text-sm">
                  Admin
                  <span className="text-xs font-normal text-flamencalia-albero block -mt-0.5">
                    Flamencalia
                  </span>
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

            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/flamencadmin-8x9k2m" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-white/15 text-white" : "text-neutral-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Icon name={item.icon} className="w-4.5 h-4.5" />
                    {item.label}
                  </Link>
                );
              })}

              {ownerNavItems && ownerNavItems.length > 0 && (
                <div className="pt-4 mt-4 border-t border-white/10">
                  <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400/70">
                    Owner / Devs
                  </p>
                  {ownerNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-amber-400/20 text-amber-300" : "text-amber-300/80 hover:bg-amber-400/10 hover:text-amber-300"}`}
                      >
                        <Icon name={item.icon} className="w-4.5 h-4.5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-white/10">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Icon name="chart" className="w-4.5 h-4.5" />
                  Dashboard
                </Link>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Icon name="store" className="w-4.5 h-4.5" />
                  Ver tienda
                </Link>
              </div>
            </nav>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 px-1 mb-3">
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-amber-400 capitalize">{role}</p>
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
