import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const column = profile?.role === "seller" ? "seller_id" : "buyer_id";

  const { data: orders } = await supabase
    .from("orders")
    .select("*, product:products(title)")
    .eq(column, user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

      {orders && orders.length > 0 ? (
        <div className="border rounded-xl divide-y">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {order.product?.title ?? "Product"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString("es-ES")}{" "}
                  &middot; Cant: {order.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatPrice(order.total_amount)}
                </p>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    order.status === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status === "paid"
                    ? "Pagado"
                    : order.status === "pending"
                      ? "Pendiente"
                      : order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Aún no hay pedidos.</p>
      )}
    </div>
  );
}
