import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { OrdersService } from "@/services/orders.service";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { sendOrderStatusEmail } from "@/lib/email";
import { z } from "zod";

const updateOrderStatusSchema = z.object({
  status: z.enum(["shipped", "delivered"]),
  tracking_number: z.string().max(100).optional(),
  tracking_url: z.string().url().max(500).optional(),
});

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

// PATCH /api/orders/[id] — Update order status (seller only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rl = await rateLimit(request, "api");
  if (rl) return rl;

  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.flatten() }, 400);
    }

    const service = new OrdersService(supabase);
    const order = await service.updateStatus(id, user.id, parsed.data);

    // Send email to buyer about status change
    if (order.buyer_id) {
      const { data: buyerAuth } = await supabaseAdmin.auth.admin.getUserById(
        order.buyer_id,
      );
      if (buyerAuth?.user?.email) {
        const { data: prod } = await supabase
          .from("products")
          .select("title")
          .eq("id", order.product_id)
          .single();
        sendOrderStatusEmail(
          buyerAuth.user.email,
          prod?.title ?? "Producto",
          parsed.data.status,
          id,
        ).catch(() => {});
      }
    }

    return apiResponse(order);
  } catch (error) {
    return apiError(error);
  }
}
