import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PaymentsService } from "@/services/payments.service";
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
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await PaymentsService.handleCheckoutCompleted(session);
        break;
      }
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await PaymentsService.handleAccountUpdated(account);
        break;
      }
    }
  } catch (error) {
    console.error(`Webhook error for ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
