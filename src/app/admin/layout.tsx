import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Icon } from "@/components/icons";

const adminNav = [
  { href: "/admin", label: "Resumen", icon: "chart" },
  { href: "/admin/users", label: "Usuarios", icon: "sparkle" },
  { href: "/admin/products", label: "Productos", icon: "package" },
  { href: "/admin/orders", label: "Pedidos", icon: "receipt" },
];

const ownerNav = [
  { href: "/admin/site-settings", label: "Configuración web", icon: "gear" },
  { href: "/admin/team", label: "Equipo admin", icon: "medal" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const auth = await isAdmin();
  if (!auth.authorized) redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  const isOwnerOrDev = auth.role === "owner" || auth.role === "dev";

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-linear-to-b from-slate-900 to-slate-800 p-5 flex flex-col shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-white mb-8 px-1"
        >
          <Image
            src="/gutnes-logo.png"
            alt="GutnesPlace"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span>
            Admin
            <span className="text-xs font-normal text-slate-400 block -mt-0.5">
              GutnesPlace
            </span>
          </span>
        </Link>

        <nav className="space-y-1 flex-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <Icon name={item.icon} className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          ))}

          {/* Owner/Dev section */}
          {isOwnerOrDev && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400/70">
                Owner / Devs
              </p>
              {ownerNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-300/80 hover:bg-amber-400/10 hover:text-amber-300 transition-all"
                >
                  <Icon name={item.icon} className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Icon name="chart" className="w-4.5 h-4.5" />
              Dashboard
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Icon name="store" className="w-4.5 h-4.5" />
              Ver tienda
            </Link>
          </div>
        </nav>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
              {profile?.display_name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name}
              </p>
              <p className="text-xs text-amber-400 capitalize">{auth.role}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
