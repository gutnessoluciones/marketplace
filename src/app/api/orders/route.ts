import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OrdersService } from "@/services/orders.service";
import { CouponsService } from "@/services/coupons.service";
import { createOrderSchema } from "@/validations/schemas";
import { apiResponse, apiError } from "@/lib/utils";

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.flatten() }, 400);
    }

    // Validate coupon if provided
    let couponData: { coupon_id: string; discount: number } | null = null;
    if (parsed.data.coupon_code) {
      const couponService = new CouponsService(supabase);
      // We need price to validate - fetch product price first
      const { data: product } = await supabase
        .from("products")
        .select("price")
        .eq("id", parsed.data.product_id)
        .single();
      if (product) {
        const totalAmount = product.price * (parsed.data.quantity ?? 1);
        const result = await couponService.validate(
          parsed.data.coupon_code,
          totalAmount,
        );
        couponData = { coupon_id: result.coupon.id, discount: result.discount };
      }
    }

    const service = new OrdersService(supabase);
    const order = await service.create(user.id, {
      ...parsed.data,
      coupon_id: couponData?.coupon_id,
      discount_amount: couponData?.discount,
    });

    // Record coupon usage
    if (couponData) {
      const couponService = new CouponsService(supabase);
      await couponService
        .use(couponData.coupon_id, user.id, order.id)
        .catch(() => {});
    }

    return apiResponse(order, 201);
  } catch (error) {
    return apiError(error);
  }
}
