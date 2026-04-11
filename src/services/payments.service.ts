import { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppError } from "@/lib/utils";
import Stripe from "stripe";

const PLATFORM_FEE_PERCENT = 10;

export class PaymentsService {
  constructor(private supabase: SupabaseClient) {}

  async createCheckoutSession(orderId: string, buyerId: string) {
    const { data: order } = await this.supabase
      .from("orders")
      .select(
        "*, seller:profiles!seller_id(stripe_account_id), product:products(title, images)",
      )
      .eq("id", orderId)
      .eq("buyer_id", buyerId)
      .eq("status", "pending")
      .single();

    if (!order) throw new AppError("Order not found", 404);
    if (!order.seller?.stripe_account_id) {
      throw new AppError("Seller not set up for payments", 400);
    }

    const platformFee = Math.round(
      (order.total_amount * PLATFORM_FEE_PERCENT) / 100,
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: order.product.title,
              images: order.product.images?.slice(0, 1) || [],
            },
            unit_amount: order.total_amount,
          },
          quantity: order.quantity,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: order.seller.stripe_account_id,
        },
      },
      metadata: {
        order_id: order.id,
        buyer_id: buyerId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${order.product_id}?cancelled=true`,
    });

    await this.supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    return { url: session.url };
  }

  static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.order_id;
    if (!orderId) return;

    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string,
    );

    // Verify payment amount matches the order
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("total_amount, quantity")
      .eq("id", orderId)
      .single();

    if (!order) {
      console.error(`Webhook: order ${orderId} not found`);
      return;
    }

    if (paymentIntent.amount < order.total_amount) {
      console.error(
        `Webhook amount mismatch for order ${orderId}: expected ${order.total_amount}, got ${paymentIntent.amount}`,
      );
      return;
    }

    await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("id", orderId);

    const fee = paymentIntent.application_fee_amount || 0;
    await supabaseAdmin.from("payments").insert({
      order_id: orderId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      platform_fee: fee,
      seller_payout: paymentIntent.amount - fee,
      status: "succeeded",
    });

    // Decrement stock
    const { data: stockOrder } = await supabaseAdmin
      .from("orders")
      .select("product_id, quantity")
      .eq("id", orderId)
      .single();

    if (stockOrder) {
      await supabaseAdmin.rpc("decrement_stock", {
        p_id: stockOrder.product_id,
        qty: stockOrder.quantity,
      });

      // Create notification for seller
      const { data: fullOrder } = await supabaseAdmin
        .from("orders")
        .select("seller_id, product:products!inner(title)")
        .eq("id", orderId)
        .single();

      if (fullOrder?.seller_id) {
        const productTitle = (fullOrder.product as unknown as { title: string })
          ?.title;
        await supabaseAdmin.from("notifications").insert({
          user_id: fullOrder.seller_id,
          type: "order_paid",
          title: "¡Nueva venta!",
          message: `Se ha vendido "${productTitle ?? "Producto"}". Revisa tus pedidos.`,
          data: { order_id: orderId },
        });

        // Auto-create conversation between buyer and seller
        const { data: buyerOrder } = await supabaseAdmin
          .from("orders")
          .select("buyer_id, product_id")
          .eq("id", orderId)
          .single();

        if (buyerOrder) {
          // Check if conversation already exists
          const { data: existing } = await supabaseAdmin
            .from("conversations")
            .select("id")
            .eq("product_id", buyerOrder.product_id)
            .eq("buyer_id", buyerOrder.buyer_id)
            .maybeSingle();

          const conversationId = existing?.id ?? (await (async () => {
            const { data: newConv } = await supabaseAdmin
              .from("conversations")
              .insert({
                product_id: buyerOrder.product_id,
                buyer_id: buyerOrder.buyer_id,
                seller_id: fullOrder.seller_id,
              })
              .select("id")
              .single();
            return newConv?.id;
          })());

          if (conversationId) {
            await supabaseAdmin.from("messages").insert({
              conversation_id: conversationId,
              sender_id: buyerOrder.buyer_id,
              content: `¡Hola! Acabo de comprar "${productTitle ?? "tu producto"}". ¿Cómo coordinamos el envío?`,
            });
            await supabaseAdmin
              .from("conversations")
              .update({ last_message_at: new Date().toISOString() })
              .eq("id", conversationId);
          }
        }
      }
    }
  }

  static async handleAccountUpdated(account: Stripe.Account) {
    if (account.charges_enabled) {
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_onboarding_complete: true })
        .eq("stripe_account_id", account.id);
    }
  }
}
