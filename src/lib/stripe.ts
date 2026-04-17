import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DEFAULT_PLATFORM_FEE_PERCENT = 10;
let _cachedFeePercent: number | null = null;
let _cachedFeeTimestamp = 0;
const FEE_CACHE_TTL = 60_000; // 1 minuto

/**
 * Lee el porcentaje de comisión desde site_settings (cacheado 1 min).
 * Fallback a 10% si no se puede leer de la BD.
 */
export async function getPlatformFeePercent(): Promise<number> {
  const now = Date.now();
  if (_cachedFeePercent !== null && now - _cachedFeeTimestamp < FEE_CACHE_TTL) {
    return _cachedFeePercent;
  }
  try {
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "fees")
      .single();
    const percent = data?.value?.platform_fee_percent;
    if (typeof percent === "number" && percent >= 0 && percent <= 50) {
      _cachedFeePercent = percent;
      _cachedFeeTimestamp = now;
      return percent;
    }
  } catch {
    // fallback silencioso
  }
  return DEFAULT_PLATFORM_FEE_PERCENT;
}

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
