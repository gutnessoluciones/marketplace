import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UnreadBadge } from "@/components/social/unread-badge";
import { Icon } from "@/components/icons";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

const sellerNav = [
  { href: "/dashboard", label: "Panel Principal", icon: "chart" },
  { href: "/dashboard/products", label: "Mis Productos", icon: "dress" },
  { href: "/dashboard/orders", label: "Pedidos", icon: "receipt" },
  { href: "/dashboard/offers", label: "Ofertas", icon: "tag" },
  { href: "/dashboard/disputes", label: "Disputas", icon: "alertTriangle" },
  { href: "/dashboard/chat", label: "Mensajes", icon: "message" },
  { href: "/dashboard/favorites", label: "Favoritos", icon: "heart" },
  { href: "/dashboard/collections", label: "Armarios", icon: "closet" },
  { href: "/dashboard/settings", label: "Configuración", icon: "gear" },
];

const buyerNav = [
  { href: "/dashboard", label: "Panel Principal", icon: "chart" },
  { href: "/dashboard/orders", label: "Mis Compras", icon: "receipt" },
  { href: "/dashboard/offers", label: "Mis Ofertas", icon: "tag" },
  { href: "/dashboard/disputes", label: "Disputas", icon: "alertTriangle" },
  { href: "/dashboard/chat", label: "Mensajes", icon: "message" },
  { href: "/dashboard/favorites", label: "Favoritos", icon: "heart" },
  { href: "/dashboard/collections", label: "Armarios", icon: "closet" },
  { href: "/dashboard/settings", label: "Configuración", icon: "gear" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  const isSeller = profile?.role === "seller";
  const navItems = isSeller ? sellerNav : buyerNav;

  return (
    <div className="min-h-screen flex bg-flamencalia-cream">
      {/* Mobile top bar */}
      <MobileSidebar
        navItems={navItems}
        displayName={profile?.display_name ?? "U"}
        isSeller={isSeller}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-linear-to-b from-flamencalia-black to-flamencalia-red-dark p-5 flex-col shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white mb-8 px-1"
        >
          <Image
            src="/cliente/Abanico.svg"
            alt="Flamencalia"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <div>
            <span className="font-serif text-base tracking-wide">
              FLAMENCALIA
            </span>
            <p className="text-[9px] text-flamencalia-albero-light italic -mt-0.5">
              &ldquo;Larga vida a tu Flamenca&rdquo;
            </p>
          </div>
        </Link>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-flamencalia-albero-pale hover:bg-white/10 hover:text-white transition-all"
            >
              <span className="text-base">
                <Icon name={item.icon} className="w-4.5 h-4.5" />
              </span>
              {item.label}
              {item.href === "/dashboard/chat" && <UnreadBadge />}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href="/products"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-flamencalia-albero/50 hover:bg-white/10 hover:text-white transition-all"
            >
              <span className="text-base">
                <Icon name="store" className="w-4.5 h-4.5" />
              </span>
              Ver tienda
            </Link>
          </div>
        </nav>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="w-9 h-9 rounded-full bg-flamencalia-albero flex items-center justify-center text-flamencalia-black font-bold text-sm">
              {profile?.display_name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name}
              </p>
              <p className="text-xs text-flamencalia-albero/60">
                {isSeller ? "Proveedor" : "Cliente"}
              </p>
            </div>
            <NotificationBell />
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8 overflow-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
    >
      {children}
    </Link>
  );
}
