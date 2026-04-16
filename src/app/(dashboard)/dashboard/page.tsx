import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { SellerBalance } from "@/components/dashboard/seller-balance";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_onboarding_complete, display_name")
    .eq("id", user.id)
    .single();

  // Fetch recent orders (both as seller and buyer)
  const column = "seller_id";
  const { data: recentOrders, count: totalOrders } = (await supabase
    .from("orders")
    .select(
      "id, total_amount, status, created_at, product:products!inner(title)",
      {
        count: "exact",
      },
    )
    .eq(column, user.id)
    .order("created_at", { ascending: false })
    .limit(5)) as {
    data: Array<{
      id: string;
      total_amount: number;
      status: string;
      created_at: string;
      product: { title: string };
    }> | null;
    count: number | null;
  };

  // Products count
  const { count: productCountRaw } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", user.id);
  const productCount = productCountRaw ?? 0;

  // Revenue for sellers
  let totalRevenue = 0;
  let deliveredRevenue = 0;
  let totalViews = 0;
  let totalFavorites = 0;
  let pendingOffers = 0;
  let monthlyRevenue: { month: string; amount: number }[] = [];
  {
    const { data: paidOrders } = await supabase
      .from("orders")
      .select("total_amount, status, created_at")
      .eq("seller_id", user.id)
      .in("status", ["paid", "shipped", "delivered"]);

    totalRevenue = paidOrders?.reduce((sum, o) => sum + o.total_amount, 0) ?? 0;
    deliveredRevenue =
      paidOrders
        ?.filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + o.total_amount, 0) ?? 0;

    // Monthly revenue (last 6 months)
    const months: Record<string, number> = {};
    paidOrders?.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] ?? 0) + o.total_amount;
    });
    monthlyRevenue = Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({ month, amount }));

    // Total views across products
    const { data: viewsData } = await supabase
      .from("products")
      .select("views_count, likes_count")
      .eq("seller_id", user.id);
    totalViews =
      viewsData?.reduce((sum, p) => sum + (p.views_count ?? 0), 0) ?? 0;
    totalFavorites =
      viewsData?.reduce((sum, p) => sum + (p.likes_count ?? 0), 0) ?? 0;

    // Pending offers
    const { count: offersCount } = await supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("status", "pending");
    pendingOffers = offersCount ?? 0;
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-flamencalia-black">
          ¡Hola, {profile?.display_name}!
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      {/* Aviso de onboarding Stripe */}
      {!profile?.stripe_onboarding_complete && (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">
              <Icon name="alertTriangle" className="w-4 h-4 inline mr-1" />{" "}
              Configura Stripe para recibir pagos
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Completa la configuración para que tus clientes puedan pagar.
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="shrink-0 bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors"
          >
            Configurar
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Total Pedidos
            </span>
            <span className="w-8 h-8 rounded-lg bg-flamencalia-red/5 flex items-center justify-center text-flamencalia-red">
              <Icon name="receipt" className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-bold text-flamencalia-black">
            {totalOrders ?? 0}
          </p>
        </div>

        <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Productos
            </span>
            <span className="w-8 h-8 rounded-lg bg-flamencalia-albero-pale/30 flex items-center justify-center text-flamencalia-albero">
              <Icon name="package" className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-bold text-flamencalia-black">
            {productCount}
          </p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Ingresos
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-400">
              <Icon name="euro" className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-bold text-flamencalia-black">
            {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Seller Balance */}
      {profile?.stripe_onboarding_complete && (
        <div className="mb-6">
          <SellerBalance />
        </div>
      )}

      {/* Quick Actions */}
      {/* Extra stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-neutral-400">Visitas totales</span>
          <p className="text-xl font-bold text-neutral-800 mt-1">
            {totalViews.toLocaleString("es-ES")}
          </p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-neutral-400">Favoritos</span>
          <p className="text-xl font-bold text-neutral-800 mt-1">
            {totalFavorites}
          </p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-neutral-400">Ofertas pendientes</span>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {pendingOffers}
          </p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-neutral-400">Entregado</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatPrice(deliveredRevenue)}
          </p>
        </div>
      </div>

      {/* Monthly Revenue Chart (simple bar) */}
      {monthlyRevenue.length > 0 && (
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4">
            Ingresos mensuales
          </h3>
          <div className="flex items-end gap-2 h-32">
            {monthlyRevenue.map((m) => {
              const maxAmount = Math.max(
                ...monthlyRevenue.map((r) => r.amount),
                1,
              );
              const height = Math.max((m.amount / maxAmount) * 100, 4);
              const [year, month] = m.month.split("-");
              const label = new Date(
                Number(year),
                Number(month) - 1,
              ).toLocaleDateString("es-ES", { month: "short" });
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {formatPrice(m.amount)}
                  </span>
                  <div
                    className="w-full bg-flamencalia-albero/80 rounded-t-md"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-neutral-500 capitalize">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversion metric */}
      {totalViews > 0 && (totalOrders ?? 0) > 0 && (
        <div className="bg-linear-to-r from-flamencalia-cream to-flamencalia-albero-pale/20 border border-flamencalia-albero-pale/30 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Tasa de conversión
            </p>
            <p className="text-2xl font-bold text-flamencalia-black mt-1">
              {(((totalOrders ?? 0) / totalViews) * 100).toFixed(2)}%
            </p>
          </div>
          <div className="text-right text-xs text-neutral-400">
            <p>
              {totalViews} visitas → {totalOrders} pedidos
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/products/new"
          className="bg-flamencalia-red border border-flamencalia-red rounded-2xl p-5 shadow-sm hover:shadow-md hover:bg-flamencalia-red-dark transition-all group"
        >
          <span className="text-2xl block mb-2 text-white/80">
            <Icon name="plus" className="w-6 h-6" />
          </span>
          <p className="text-sm font-semibold text-white transition-colors">
            Subir Producto
          </p>
          <p className="text-xs text-white/70 mt-0.5">
            Publica un nuevo artículo
          </p>
        </Link>
        <Link
          href="/dashboard/products"
          className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-flamencalia-albero-pale transition-all group"
        >
          <span className="text-2xl block mb-2 text-neutral-400">
            <Icon name="clipboard" className="w-6 h-6" />
          </span>
          <p className="text-sm font-semibold text-neutral-700 group-hover:text-flamencalia-red-dark transition-colors">
            Gestionar Productos
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Edita precios, stock y más
          </p>
        </Link>
        <Link
          href={`/sellers/${user.id}`}
          className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-flamencalia-albero-pale transition-all group"
        >
          <span className="text-2xl block mb-2 text-neutral-400">
            <Icon name="user" className="w-6 h-6" />
          </span>
          <p className="text-sm font-semibold text-neutral-700 group-hover:text-flamencalia-red-dark transition-colors">
            Ver mi Perfil
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">Tu tienda pública</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-flamencalia-black">
            Últimos pedidos
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-xs text-flamencalia-red font-medium hover:text-flamencalia-red-dark transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="divide-y divide-neutral-50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 hover:bg-neutral-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                    <Icon name="receipt" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      {order.product?.title ?? "Producto"}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(order.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      order.status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : order.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-neutral-50 text-neutral-600"
                    }`}
                  >
                    {order.status === "paid"
                      ? "Pagado"
                      : order.status === "pending"
                        ? "Pendiente"
                        : order.status}
                  </span>
                  <p className="text-sm font-semibold text-flamencalia-black">
                    {formatPrice(order.total_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <span className="text-4xl block mb-3 text-neutral-300">
              <Icon name="inbox" className="w-10 h-10 mx-auto" />
            </span>
            <p className="text-sm text-neutral-400">Aún no hay pedidos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
