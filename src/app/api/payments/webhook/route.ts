import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PaymentsService } from "@/services/payments.service";
import { BoostsService } from "@/services/boosts.service";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === "boost") {
          // Activate boost after successful payment
          const boostService = new BoostsService(supabaseAdmin);
          await boostService.create(
            session.metadata.seller_id,
            session.metadata.product_id,
            session.metadata.boost_type,
          );
        } else if (session.metadata?.type === "batch") {
          // Batch checkout: process each order
          const orderIds = session.metadata.order_ids?.split(",") ?? [];
          for (const orderId of orderIds) {
            const batchSession = {
              ...session,
              metadata: {
                ...session.metadata,
                order_id: orderId,
              },
            } as unknown as Stripe.Checkout.Session;
            await PaymentsService.handleCheckoutCompleted(batchSession);
          }
        } else {
          await PaymentsService.handleCheckoutCompleted(session);
        }
        break;
      }
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await PaymentsService.handleAccountUpdated(account);
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const piId =
          typeof dispute.payment_intent === "string"
            ? dispute.payment_intent
            : dispute.payment_intent?.id;
        if (piId) {
          // Find order by stripe_payment_intent_id
          const { data: payment } = await supabaseAdmin
            .from("payments")
            .select("order_id")
            .eq("stripe_payment_intent_id", piId)
            .maybeSingle();
          if (payment?.order_id) {
            // Mark order as disputed
            await supabaseAdmin
              .from("orders")
              .update({ status: "disputed" })
              .eq("id", payment.order_id);
            // Get order info for notifications
            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("buyer_id, seller_id, product:products(title)")
              .eq("id", payment.order_id)
              .single();
            if (order) {
              const title =
                (order.product as unknown as { title: string })?.title ??
                "Producto";
              await supabaseAdmin.from("notifications").insert([
                {
                  user_id: order.seller_id,
                  type: "order_disputed",
                  title: "⚠️ Chargeback recibido",
                  message: `El comprador ha abierto un chargeback en Stripe para "${title}". Contacta con soporte.`,
                  data: { order_id: payment.order_id },
                },
                {
                  user_id: order.buyer_id,
                  type: "order_disputed",
                  title: "Disputa de pago abierta",
                  message: `Se ha registrado una disputa de pago para "${title}".`,
                  data: { order_id: payment.order_id },
                },
              ]);
            }
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error(`Webhook error for ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
