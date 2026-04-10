import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, stripe_onboarding_complete, display_name")
    .eq("id", user.id)
    .single();

  const isSeller = profile?.role === "seller";

  // Fetch recent orders
  const column = isSeller ? "seller_id" : "buyer_id";
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

  // Products count for sellers
  let productCount = 0;
  if (isSeller) {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id);
    productCount = count ?? 0;
  }

  // Revenue for sellers
  let totalRevenue = 0;
  if (isSeller) {
    const { data: paidOrders } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("seller_id", user.id)
      .eq("status", "paid");
    totalRevenue = paidOrders?.reduce((sum, o) => sum + o.total_amount, 0) ?? 0;
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-flamencalia-black">
          ¡Hola, {profile?.display_name}!
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          {isSeller
            ? "Aquí tienes un resumen de tu actividad"
            : "Aquí puedes ver tus compras y actividad"}
        </p>
      </div>

      {/* Aviso de onboarding Stripe */}
      {isSeller && !profile?.stripe_onboarding_complete && (
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              {isSeller ? "Total Pedidos" : "Mis Compras"}
            </span>
            <span className="w-8 h-8 rounded-lg bg-flamencalia-red/5 flex items-center justify-center text-flamencalia-red">
              <Icon name="receipt" className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-bold text-flamencalia-black">
            {totalOrders ?? 0}
          </p>
        </div>

        {isSeller && (
          <>
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
                  <Icon name="dollar" className="w-4 h-4" />
                </span>
              </div>
              <p className="text-3xl font-bold text-flamencalia-black">
                {formatPrice(totalRevenue)}
              </p>
            </div>
          </>
        )}

        {!isSeller && (
          <div className="bg-flamencalia-red rounded-2xl p-5 text-white col-span-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold opacity-90">
                ¿Buscas algo nuevo?
              </p>
              <p className="text-xs opacity-70 mt-0.5">
                Explora cientos de productos únicos
              </p>
            </div>
            <Link
              href="/products"
              className="bg-white text-flamencalia-red-dark px-5 py-2 rounded-lg text-sm font-bold hover:bg-flamencalia-red/5 transition-colors"
            >
              Explorar
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions for Sellers */}
      {isSeller && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard/products/new"
            className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-flamencalia-albero-pale transition-all group"
          >
            <span className="text-2xl block mb-2 text-neutral-400">
              <Icon name="plus" className="w-6 h-6" />
            </span>
            <p className="text-sm font-semibold text-neutral-700 group-hover:text-flamencalia-red-dark transition-colors">
              Añadir Producto
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
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
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-flamencalia-black">
            {isSeller ? "Últimos pedidos" : "Últimas compras"}
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
            {!isSeller && (
              <Link
                href="/products"
                className="text-sm text-flamencalia-red font-medium mt-2 inline-block hover:text-flamencalia-red-dark"
              >
                Explorar productos →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
