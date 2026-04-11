import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CouponsService } from "@/services/coupons.service";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const validateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  amount: z.number().int().positive(),
});

// POST /api/coupons/validate
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = validateCouponSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: "Datos inválidos" }, 400);
    }

    const service = new CouponsService(supabase);
    const { coupon, discount } = await service.validate(
      parsed.data.code,
      parsed.data.amount,
    );

    return apiResponse({
      valid: true,
      coupon_id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount,
    });
  } catch (error) {
    return apiError(error);
  }
}
