import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

export class CouponsService {
  constructor(private supabase: SupabaseClient) {}

  /** Validate and return coupon details */
  async validate(code: string, orderAmount: number) {
    const { data: coupon, error } = await this.supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("active", true)
      .single();

    if (error || !coupon) throw new AppError("Cupón no válido", 404);

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      throw new AppError("Este cupón aún no es válido", 400);
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      throw new AppError("Este cupón ha expirado", 400);
    }
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      throw new AppError("Este cupón ha alcanzado su límite de usos", 400);
    }
    if (coupon.min_purchase && orderAmount < coupon.min_purchase) {
      throw new AppError(
        `Compra mínima: ${(coupon.min_purchase / 100).toFixed(2)}€`,
        400,
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = Math.round((orderAmount * coupon.discount_value) / 100);
    } else {
      discount = Math.min(coupon.discount_value, orderAmount);
    }

    return { coupon, discount };
  }

  /** Record coupon usage */
  async use(couponId: string, userId: string, orderId: string) {
    // Check if user already used this coupon
    const { data: existing } = await this.supabase
      .from("coupon_uses")
      .select("id")
      .eq("coupon_id", couponId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) throw new AppError("Ya has usado este cupón", 409);

    // Insert usage
    const { error: useErr } = await this.supabase
      .from("coupon_uses")
      .insert({ coupon_id: couponId, user_id: userId, order_id: orderId });

    if (useErr) throw new AppError(useErr.message, 500);

    // Increment counter
    await this.supabase.rpc("increment_coupon_uses", { coupon_uuid: couponId });

    return true;
  }

  /** List all coupons (admin) */
  async listAll(page = 1, limit = 20) {
    const { data, error, count } = await this.supabase
      .from("coupons")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }

  /** Create coupon (admin) */
  async create(input: {
    code: string;
    description?: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_purchase?: number;
    max_uses?: number;
    valid_from?: string;
    valid_until?: string;
  }) {
    const { data, error } = await this.supabase
      .from("coupons")
      .insert({
        ...input,
        code: input.code.toUpperCase().trim(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        throw new AppError("Ya existe un cupón con ese código", 409);
      throw new AppError(error.message, 500);
    }
    return data;
  }
}
