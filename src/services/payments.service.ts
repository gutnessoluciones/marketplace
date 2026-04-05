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
        "*, seller:profiles!seller_id(stripe_account_id), product:products(title, images)"
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
      order.total_amount * PLATFORM_FEE_PERCENT / 100
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?cancelled=true`,
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

    await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("id", orderId);

    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );

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
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("product_id, quantity")
      .eq("id", orderId)
      .single();

    if (order) {
      await supabaseAdmin.rpc("decrement_stock", {
        p_id: order.product_id,
        qty: order.quantity,
      });
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
