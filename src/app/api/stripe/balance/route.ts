import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get seller's Stripe account ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_account_id || !profile.stripe_onboarding_complete) {
      return NextResponse.json({
        data: { available: 0, pending: 0, currency: "eur", connected: false },
      });
    }

    const balance = await stripe.balance.retrieve(
      {},
      { stripeAccount: profile.stripe_account_id },
    );

    const eurAvailable = balance.available.find((b) => b.currency === "eur");
    const eurPending = balance.pending.find((b) => b.currency === "eur");

    return NextResponse.json({
      data: {
        available: eurAvailable?.amount ?? 0,
        pending: eurPending?.amount ?? 0,
        currency: "eur",
        connected: true,
      },
    });
  } catch (error) {
    console.error("[BALANCE] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener el balance" },
      { status: 500 },
    );
  }
}
