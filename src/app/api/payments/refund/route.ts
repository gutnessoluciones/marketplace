import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { apiResponse, apiError, AppError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/admin";

// POST /api/payments/refund — Process a refund for an order
export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(request, "api");
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "No autenticado" }, 401);

    const body = await request.json();
    const { orderId, reason } = body as {
      orderId: string;
      reason?: string;
    };

    if (
      !orderId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        orderId,
      )
    ) {
      return apiResponse({ error: "ID de pedido inválido" }, 400);
    }

    // Get order with payment info
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*, payment:payments(*)")
      .eq("id", orderId)
      .single();

    if (!order) throw new AppError("Pedido no encontrado", 404);

    // Solo admin puede procesar reembolsos
    const auth = await isAdmin();
    if (!auth.authorized) {
      return apiResponse(
        {
          error:
            "Solo un administrador puede procesar reembolsos. Abre una disputa si necesitas un reembolso.",
        },
        403,
      );
    }

    // Can only refund paid/shipped orders
    if (!["paid", "shipped"].includes(order.status)) {
      throw new AppError(
        "Solo se pueden reembolsar pedidos pagados o enviados",
        400,
      );
    }

    // Find the Stripe payment intent
    const payment = Array.isArray(order.payment)
      ? order.payment[0]
      : order.payment;
    const stripePI = payment?.stripe_payment_intent_id;
    if (!stripePI) {
      throw new AppError("No se encontró el pago en Stripe", 400);
    }

    // Process refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: stripePI,
      reason: "requested_by_customer",
      metadata: {
        order_id: orderId,
        requested_by: user.id,
        reason: reason?.slice(0, 200) || "Solicitud de reembolso",
      },
    });

    // Update order status
    await supabaseAdmin
      .from("orders")
      .update({ status: "refunded" })
      .eq("id", orderId);

    // Restore stock
    await supabaseAdmin.rpc("increment_stock", {
      p_id: order.product_id,
      qty: order.quantity,
    });

    // Notify both parties
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("title")
      .eq("id", order.product_id)
      .single();

    const title = product?.title ?? "Producto";

    await supabaseAdmin.from("notifications").insert([
      {
        user_id: order.buyer_id,
        type: "order_refunded",
        title: "Reembolso procesado",
        message: `Tu pedido de "${title}" ha sido reembolsado.`,
        data: { order_id: orderId },
      },
      {
        user_id: order.seller_id,
        type: "order_refunded",
        title: "Pedido reembolsado",
        message: `El pedido de "${title}" ha sido reembolsado al comprador.`,
        data: { order_id: orderId },
      },
    ]);

    return apiResponse({
      refunded: true,
      refundId: refund.id,
      amount: refund.amount,
    });
  } catch (error) {
    return apiError(error);
  }
}
