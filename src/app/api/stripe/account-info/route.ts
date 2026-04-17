import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/stripe/account-info — Get seller's own Stripe account info
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "api");
  if (rl) return rl;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_account_id || !profile.stripe_onboarding_complete) {
      return apiResponse({ connected: false });
    }

    // Fetch account info from Stripe — only safe, non-sensitive fields
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    return apiResponse({
      connected: true,
      account: {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        country: account.country,
        default_currency: account.default_currency,
        business_type: account.business_type,
        created: account.created,
        // Payout schedule info
        payout_schedule: account.settings?.payouts?.schedule
          ? {
              interval: account.settings.payouts.schedule.interval,
              delay_days: account.settings.payouts.schedule.delay_days,
            }
          : null,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
