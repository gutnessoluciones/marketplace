import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentsService } from "@/services/payments.service";
import { checkoutSchema } from "@/validations/schemas";
import { apiResponse, apiError } from "@/lib/utils";

// POST /api/payments/checkout
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.flatten() }, 400);
    }

    const service = new PaymentsService(supabase);
    const result = await service.createCheckoutSession(parsed.data.orderId, user.id);
    return apiResponse(result);
  } catch (error) {
    return apiError(error);
  }
}
