import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OrdersService } from "@/services/orders.service";
import { apiResponse, apiError } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const service = new OrdersService(supabase);
    const order = await service.getById(id, user.id);
    return apiResponse(order);
  } catch (error) {
    return apiError(error);
  }
}
