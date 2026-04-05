import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/layout/sign-out-button";

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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50/50 p-6 flex flex-col">
        <Link href="/" className="text-lg font-bold tracking-tight mb-8">
          🛍️ Marketplace
        </Link>

        <nav className="space-y-1 flex-1">
          <NavLink href="/dashboard">Panel Principal</NavLink>
          {isSeller && (
            <NavLink href="/dashboard/products">Mis Productos</NavLink>
          )}
          <NavLink href="/dashboard/orders">Pedidos</NavLink>
          <NavLink href="/dashboard/settings">Configuración</NavLink>
        </nav>

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-0.5">
            {profile?.display_name}
          </p>
          <p className="text-xs text-gray-400 mb-3 capitalize">
            {profile?.role === "seller" ? "Vendedor" : "Comprador"}
          </p>
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 bg-white">{children}</main>
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
