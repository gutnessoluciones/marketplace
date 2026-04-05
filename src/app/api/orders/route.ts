import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OrdersService } from "@/services/orders.service";
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

    const service = new OrdersService(supabase);
    const order = await service.create(user.id, parsed.data);
    return apiResponse(order, 201);
  } catch (error) {
    return apiError(error);
  }
}
