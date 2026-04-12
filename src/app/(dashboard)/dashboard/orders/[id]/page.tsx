import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrdersService } from "@/services/orders.service";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import Link from "next/link";
import { ReviewForm } from "@/components/products/review-form";
import { OrderStatusUpdate } from "@/components/orders/order-status-update";
import { ChatButton } from "@/components/social/chat-button";
import { DisputeButton } from "@/components/orders/dispute-button";
import { RefundRequest } from "@/components/orders/refund-request";

const STATUS_MAP: Record<
  string,
  { label: string; color: string; step: number }
> = {
  pending: { label: "Pendiente", color: "bg-amber-50 text-amber-700", step: 0 },
  paid: { label: "Pagado", color: "bg-emerald-50 text-emerald-700", step: 1 },
  shipped: { label: "Enviado", color: "bg-blue-50 text-blue-700", step: 2 },
  delivered: {
    label: "Entregado",
    color: "bg-flamencalia-albero-pale/30 text-flamencalia-red-dark",
    step: 3,
  },
  cancelled: { label: "Cancelado", color: "bg-red-50 text-red-700", step: -1 },
  refunded: {
    label: "Reembolsado",
    color: "bg-neutral-100 text-neutral-600",
    step: -1,
  },
};

const STEPS = [
  { label: "Pagado", icon: "dollar" as const },
  { label: "Enviado", icon: "package" as const },
  { label: "Entregado", icon: "checkCircle" as const },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
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

  const service = new OrdersService(supabase);
  let order;
  try {
    order = await service.getById(id, user.id);
  } catch {
    redirect("/dashboard/orders");
  }

  const isSeller = profile?.role === "seller";
  const isBuyer = order.buyer_id === user.id;
  const status = STATUS_MAP[order.status] ?? {
    label: order.status,
    color: "bg-neutral-100 text-neutral-600",
    step: -1,
  };

  // Check if buyer already reviewed
  let hasReviewed = false;
  if (isBuyer && (order.status === "paid" || order.status === "delivered")) {
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", order.id)
      .single();
    hasReviewed = !!existingReview;
  }

  // Check if seller already reviewed the buyer
  let hasReviewedBuyer = false;
  if (isSeller && (order.status === "paid" || order.status === "delivered")) {
    const { data: existingBuyerReview } = await supabase
      .from("buyer_reviews")
      .select("id")
      .eq("order_id", order.id)
      .maybeSingle();
    hasReviewedBuyer = !!existingBuyerReview;
  }

  // Check disputes
  const { data: existingDispute } = await supabase
    .from("disputes")
    .select("id, status")
    .eq("order_id", order.id)
    .in("status", ["open", "in_review"])
    .maybeSingle();

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/orders"
          className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
        >
          <svg
            className="w-4 h-4 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-flamencalia-black">
            Detalle del Pedido
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            #{order.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Status Progress */}
      {status.step >= 0 && (
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      i < status.step
                        ? "bg-emerald-500 text-white"
                        : i === status.step
                          ? "bg-flamencalia-red text-white"
                          : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    <Icon name={step.icon} className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium ${
                      i <= status.step
                        ? "text-flamencalia-red-dark"
                        : "text-neutral-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 rounded ${
                      i < status.step ? "bg-emerald-500" : "bg-neutral-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product */}
          <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Producto
            </h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-neutral-100 shrink-0 overflow-hidden">
                {order.product?.images?.length > 0 ? (
                  <img
                    src={order.product.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <Icon name="package" className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/products/${order.product_id}`}
                  className="text-sm font-semibold text-flamencalia-black hover:text-flamencalia-red transition-colors"
                >
                  {order.product?.title ?? "Producto"}
                </Link>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Cantidad: {order.quantity}
                </p>
                <p className="text-lg font-bold text-flamencalia-red-dark mt-2">
                  {formatPrice(order.total_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {(order.tracking_number || order.tracking_url) && (
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Seguimiento
              </h2>
              {order.tracking_carrier && (
                <p className="text-sm text-neutral-700 mb-1">
                  <span className="text-neutral-500">Transportista:</span>{" "}
                  <span className="font-medium uppercase">
                    {order.tracking_carrier}
                  </span>
                </p>
              )}
              {order.tracking_number && (
                <p className="text-sm text-neutral-700">
                  <span className="text-neutral-500">Nº de seguimiento:</span>{" "}
                  <span className="font-mono font-medium">
                    {order.tracking_number}
                  </span>
                </p>
              )}
              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-flamencalia-red hover:underline mt-2"
                >
                  Ver seguimiento →
                </a>
              )}
            </div>
          )}

          {/* Review Section (buyer only, paid/delivered, not yet reviewed) */}
          {isBuyer &&
            (order.status === "paid" || order.status === "delivered") &&
            !hasReviewed && (
              <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                  Deja tu reseña
                </h2>
                <ReviewForm orderId={order.id} />
              </div>
            )}

          {isBuyer && hasReviewed && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
              <p className="text-sm font-medium text-emerald-700">
                Ya has dejado una reseña para este pedido ✓
              </p>
            </div>
          )}

          {/* Seller review buyer */}
          {isSeller &&
            (order.status === "paid" || order.status === "delivered") &&
            !hasReviewedBuyer && (
              <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                  Valora al comprador
                </h2>
                <ReviewForm
                  orderId={order.id}
                  apiEndpoint="/api/buyer-reviews"
                />
              </div>
            )}
          {isSeller && hasReviewedBuyer && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
              <p className="text-sm font-medium text-emerald-700">
                Ya has valorado a este comprador ✓
              </p>
            </div>
          )}

          {/* Tracking Timeline */}
          {order.status !== "pending" && order.status !== "cancelled" && (
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                Línea temporal del envío
              </h2>
              <div className="space-y-4">
                {[
                  {
                    step: "paid",
                    label: "Pedido confirmado",
                    icon: "dollar" as const,
                    date: order.created_at,
                  },
                  {
                    step: "shipped",
                    label: "Enviado",
                    icon: "package" as const,
                    date: order.shipped_at,
                  },
                  {
                    step: "delivered",
                    label: "Entregado",
                    icon: "checkCircle" as const,
                    date: order.delivered_at,
                  },
                ].map((item, i) => {
                  const currentStep = STATUS_MAP[order.status]?.step ?? 0;
                  const isComplete = i < currentStep;
                  const isCurrent = i === currentStep - 1;
                  return (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isComplete || isCurrent ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-400"}`}
                        >
                          <Icon name={item.icon} className="w-4 h-4" />
                        </div>
                        {i < 2 && (
                          <div
                            className={`w-0.5 h-6 mt-1 ${isComplete ? "bg-emerald-500" : "bg-neutral-100"}`}
                          />
                        )}
                      </div>
                      <div className="pt-1">
                        <p
                          className={`text-sm font-medium ${isComplete || isCurrent ? "text-neutral-800" : "text-neutral-400"}`}
                        >
                          {item.label}
                        </p>
                        {item.date && (
                          <p className="text-xs text-neutral-400">
                            {new Date(item.date).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {item.step === "shipped" && order.tracking_number && (
                          <div className="mt-1.5">
                            <span className="text-xs text-neutral-500">
                              Nº:{" "}
                              <span className="font-mono">
                                {order.tracking_number}
                              </span>
                            </span>
                            {order.tracking_url && (
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-flamencalia-red hover:underline ml-2"
                              >
                                Seguir envío →
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dispute Button */}
          {(order.status === "paid" ||
            order.status === "shipped" ||
            order.status === "delivered") &&
            !existingDispute && <DisputeButton orderId={order.id} />}
          {existingDispute && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-medium text-amber-700">
                <Icon name="alertTriangle" className="w-4 h-4 inline mr-1" />
                Disputa abierta — Estado:{" "}
                {existingDispute.status === "open" ? "Abierta" : "En revisión"}
              </p>
            </div>
          )}

          {/* Refund Request (buyer only) */}
          {isBuyer && (
            <RefundRequest orderId={order.id} orderStatus={order.status} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Resumen
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Estado</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fecha</span>
                <span className="text-neutral-700">
                  {new Date(order.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Cantidad</span>
                <span className="text-neutral-700">{order.quantity}</span>
              </div>
              <div className="border-t border-neutral-100 pt-2.5 flex justify-between font-semibold">
                <span className="text-neutral-700">Total</span>
                <span className="text-flamencalia-red-dark">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
              {isSeller && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">
                      Comisión plataforma
                    </span>
                    <span className="text-neutral-400">
                      -{formatPrice(order.platform_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 font-medium">
                      Tu ganancia
                    </span>
                    <span className="text-emerald-600 font-medium">
                      {formatPrice(order.total_amount - order.platform_fee)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Seller Info (buyer view) */}
          {isBuyer && order.seller && (
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Vendedor
              </h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-flamencalia-albero-pale/30 overflow-hidden shrink-0 flex items-center justify-center">
                  {order.seller.avatar_url ? (
                    <img
                      src={order.seller.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon
                      name="user"
                      className="w-5 h-5 text-flamencalia-albero"
                    />
                  )}
                </div>
                <Link
                  href={`/sellers/${order.seller_id}`}
                  className="text-sm font-medium text-neutral-700 hover:text-flamencalia-red transition-colors"
                >
                  {order.seller.display_name}
                </Link>
              </div>
              <ChatButton
                productId={order.product_id}
                sellerId={order.seller_id}
              />
            </div>
          )}

          {/* Seller Actions */}
          {isSeller &&
            (order.status === "paid" || order.status === "shipped") && (
              <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                  Acciones
                </h2>
                <OrderStatusUpdate
                  orderId={order.id}
                  currentStatus={order.status}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
