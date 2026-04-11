import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get stats
  const [
    { count: totalUsers },
    { count: totalProducts },
    { count: totalOrders },
    { data: recentOrders },
    { data: topSellers },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select(
        "*, product:products(title), buyer:profiles!buyer_id(display_name), seller:profiles!seller_id(display_name)",
      )
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("id, display_name, role")
      .eq("role", "seller")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Calculate total revenue
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount, platform_fee")
    .in("status", ["paid", "shipped", "delivered"]);

  const totalRevenue =
    revenueData?.reduce((sum, o) => sum + o.total_amount, 0) ?? 0;
  const totalFees =
    revenueData?.reduce((sum, o) => sum + o.platform_fee, 0) ?? 0;

  const stats = [
    {
      label: "Usuarios",
      value: totalUsers ?? 0,
      icon: "sparkle",
      color: "bg-flamencalia-red/10 text-flamencalia-red",
    },
    {
      label: "Productos",
      value: totalProducts ?? 0,
      icon: "package",
      color: "bg-flamencalia-albero-pale/30 text-flamencalia-albero",
    },
    {
      label: "Pedidos",
      value: totalOrders ?? 0,
      icon: "receipt",
      color: "bg-flamencalia-albero-pale/30 text-flamencalia-red-dark",
    },
    {
      label: "Ingresos plataforma",
      value: formatPrice(totalFees),
      icon: "dollar",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-amber-50 text-amber-700" },
    paid: { label: "Pagado", color: "bg-emerald-50 text-emerald-700" },
    shipped: { label: "Enviado", color: "bg-blue-50 text-blue-700" },
    delivered: {
      label: "Entregado",
      color: "bg-flamencalia-albero-pale/30 text-flamencalia-albero",
    },
    cancelled: { label: "Cancelado", color: "bg-red-50 text-red-700" },
    refunded: {
      label: "Reembolsado",
      color: "bg-neutral-100 text-neutral-600",
    },
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-serif text-flamencalia-black">
          Panel de Administración
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Resumen general de la plataforma Flamencalia
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <Icon name={stat.icon} className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-neutral-500">
                {stat.label}
              </p>
            </div>
            <p className="text-2xl font-bold text-flamencalia-black">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">
              Últimos Pedidos
            </h2>
            <Link
              href="/flamencadmin-8x9k2m/orders"
              className="text-xs text-flamencalia-red hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-neutral-50">
            {recentOrders?.map((order) => {
              const status = STATUS_MAP[order.status] ?? {
                label: order.status,
                color: "bg-neutral-100 text-neutral-600",
              };
              return (
                <div
                  key={order.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-700 truncate">
                      {order.product?.title ?? "Producto"}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {order.buyer?.display_name} → {order.seller?.display_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-sm font-bold text-neutral-700">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              );
            })}
            {(!recentOrders || recentOrders.length === 0) && (
              <div className="px-5 py-8 text-center text-sm text-neutral-400">
                No hay pedidos aún
              </div>
            )}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">
              Vendedores
            </h2>
            <Link
              href="/flamencadmin-8x9k2m/users"
              className="text-xs text-flamencalia-red hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-neutral-50">
            {topSellers?.map((seller) => (
              <div
                key={seller.id}
                className="px-5 py-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-flamencalia-albero-pale flex items-center justify-center text-flamencalia-red font-bold text-sm">
                  {seller.display_name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-700 truncate">
                    {seller.display_name}
                  </p>
                  <p className="text-xs text-neutral-400">Proveedor</p>
                </div>
              </div>
            ))}
            {(!topSellers || topSellers.length === 0) && (
              <div className="px-5 py-8 text-center text-sm text-neutral-400">
                No hay vendedores
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="mt-6 bg-white border border-neutral-100 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-neutral-700 mb-4">
          Resumen de Ingresos
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-neutral-400 mb-1">
              Volumen total ventas
            </p>
            <p className="text-xl font-bold text-flamencalia-black">
              {formatPrice(totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Comisiones (10%)</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatPrice(totalFees)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Pagos a vendedores</p>
            <p className="text-xl font-bold text-flamencalia-red">
              {formatPrice(totalRevenue - totalFees)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
