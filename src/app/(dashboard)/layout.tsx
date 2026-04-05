import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Icon } from "@/components/icons";

const sellerNav = [
  { href: "/dashboard", label: "Panel Principal", icon: "chart" },
  { href: "/dashboard/products", label: "Mis Productos", icon: "package" },
  { href: "/dashboard/orders", label: "Pedidos", icon: "receipt" },
  { href: "/dashboard/settings", label: "Configuración", icon: "gear" },
];

const buyerNav = [
  { href: "/dashboard", label: "Panel Principal", icon: "chart" },
  { href: "/dashboard/orders", label: "Mis Compras", icon: "cart" },
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
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-indigo-950 to-slate-900 p-5 flex flex-col shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-white mb-8 px-1"
        >
          <Image
            src="/gutnes-logo.png"
            alt="GutnesPlace"
            width={32}
            height={32}
            className="rounded-lg"
          />
          GutnesPlace
        </Link>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-200 hover:bg-white/10 hover:text-white transition-all"
            >
              <span className="text-base">
                <Icon name={item.icon} className="w-[18px] h-[18px]" />
              </span>
              {item.label}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href="/products"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-300/60 hover:bg-white/10 hover:text-white transition-all"
            >
              <span className="text-base">
                <Icon name="store" className="w-[18px] h-[18px]" />
              </span>
              Ver tienda
            </Link>
          </div>
        </nav>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {profile?.display_name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name}
              </p>
              <p className="text-xs text-indigo-300/60">
                {isSeller ? "Vendedor" : "Comprador"}
              </p>
            </div>
            <NotificationBell />
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
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
