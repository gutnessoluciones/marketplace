import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-50 text-amber-700" },
  paid: { label: "Pagado", color: "bg-emerald-50 text-emerald-700" },
  shipped: { label: "Enviado", color: "bg-blue-50 text-blue-700" },
  delivered: { label: "Entregado", color: "bg-flamencalia-albero-pale/30 text-flamencalia-red-dark" },
  cancelled: { label: "Cancelado", color: "bg-red-50 text-red-700" },
  refunded: { label: "Reembolsado", color: "bg-neutral-100 text-neutral-600" },
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "*, product:products(title), buyer:profiles!buyer_id(display_name), seller:profiles!seller_id(display_name)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-flamencalia-black">Pedidos</h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          {orders?.length ?? 0} pedidos totales
        </p>
      </div>

      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">
                Pedido
              </th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">
                Comprador
              </th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">
                Vendedor
              </th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">
                Total
              </th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">
                Comisión
              </th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">
                Estado
              </th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {orders?.map((order) => {
              const status = STATUS_MAP[order.status] ?? {
                label: order.status,
                color: "bg-neutral-100 text-neutral-600",
              };
              return (
                <tr key={order.id} className="hover:bg-neutral-50/50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-neutral-700 truncate max-w-48">
                      {order.product?.title ?? "Producto"}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      #{order.id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-600">
                    {order.buyer?.display_name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-600">
                    {order.seller?.display_name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-neutral-700">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-5 py-3 text-sm text-emerald-600">
                    {formatPrice(order.platform_fee)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
