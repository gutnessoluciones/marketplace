import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, stripe_onboarding_complete")
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel Principal</h1>

      {/* Aviso de onboarding Stripe */}
      {isSeller && !profile?.stripe_onboarding_complete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-amber-800">
            Completa la configuración de Stripe para empezar a recibir pagos.
          </p>
          <Link
            href="/dashboard/settings"
            className="text-sm underline text-amber-700 mt-1 inline-block"
          >
            Ir a Configuración
          </Link>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border rounded-xl p-5 bg-gray-50/50">
          <p className="text-sm text-gray-500">Total de Pedidos</p>
          <p className="text-3xl font-bold mt-1">{totalOrders ?? 0}</p>
        </div>
      </div>

      {/* Pedidos Recientes */}
      <h2 className="text-lg font-semibold mb-3">Pedidos Recientes</h2>
      {recentOrders && recentOrders.length > 0 ? (
        <div className="border rounded-xl divide-y">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div>
                <p className="text-sm font-medium">
                  {order.product?.title ?? "Product"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatPrice(order.total_amount)}
                </p>
                <p className="text-xs capitalize text-gray-500">
                  {order.status === "paid"
                    ? "Pagado"
                    : order.status === "pending"
                      ? "Pendiente"
                      : order.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Aún no hay pedidos.</p>
      )}
    </div>
  );
}
