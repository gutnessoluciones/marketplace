import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { apiResponse, apiError } from "@/lib/utils";

// POST /api/stripe/connect — Initiate seller onboarding
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_account_id, role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "seller") {
      return apiResponse({ error: "Only sellers can connect Stripe" }, 403);
    }

    let accountId = profile.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      await supabase
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.flamencalia.com";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/dashboard/settings`,
      return_url: `${baseUrl}/dashboard/settings?stripe=complete`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    return apiError(error);
  }
}
