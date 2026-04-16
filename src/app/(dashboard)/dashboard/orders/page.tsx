import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import Link from "next/link";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-50 text-amber-700" },
  paid: { label: "Pagado", color: "bg-emerald-50 text-emerald-700" },
  shipped: { label: "Enviado", color: "bg-blue-50 text-blue-700" },
  delivered: {
    label: "Entregado",
    color: "bg-flamencalia-albero-pale/30 text-flamencalia-red-dark",
  },
  cancelled: { label: "Cancelado", color: "bg-red-50 text-red-700" },
  refunded: { label: "Reembolsado", color: "bg-neutral-100 text-neutral-600" },
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, product:products(title, images)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-flamencalia-black">
          Pedidos recibidos
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          {orders?.length ?? 0} pedidos en total
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] ?? {
              label: order.status,
              color: "bg-neutral-100 text-neutral-600",
            };
            return (
              <Link
                href={`/dashboard/orders/${order.id}`}
                key={order.id}
                className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 shrink-0 overflow-hidden">
                      {order.product?.images?.length > 0 ? (
                        <img
                          src={order.product.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Icon name="receipt" className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-700 truncate">
                        {order.product?.title ?? "Producto"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-400">
                          {new Date(order.created_at).toLocaleDateString(
                            "es-ES",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                        <span className="text-xs text-neutral-300">·</span>
                        <span className="text-xs text-neutral-400">
                          Cant: {order.quantity}
                        </span>
                        {order.platform_fee > 0 && (
                          <>
                            <span className="text-xs text-neutral-300">·</span>
                            <span className="text-xs text-neutral-400">
                              Comisión: {formatPrice(order.platform_fee)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <p className="text-sm font-bold text-flamencalia-red-dark min-w-16 text-right">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-12 text-center">
          <span className="text-5xl block mb-4 text-neutral-300">
            <Icon name="inbox" className="w-12 h-12 mx-auto" />
          </span>
          <h3 className="font-semibold text-neutral-700 mb-1">
            Aún no tienes pedidos
          </h3>
          <p className="text-sm text-neutral-400">
            Cuando alguien compre tus productos, los pedidos aparecerán aquí.
          </p>
        </div>
      )}
    </div>
  );
}
