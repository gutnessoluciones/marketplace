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
      <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col">
        <Link href="/" className="text-lg font-bold mb-8">
          Marketplace
        </Link>

        <nav className="space-y-1 flex-1">
          <NavLink href="/dashboard">Dashboard</NavLink>
          {isSeller && <NavLink href="/dashboard/products">My Products</NavLink>}
          <NavLink href="/dashboard/orders">Orders</NavLink>
          <NavLink href="/dashboard/settings">Settings</NavLink>
        </nav>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">{profile?.display_name}</p>
          <p className="text-xs text-gray-400 mb-3 capitalize">{profile?.role}</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}
