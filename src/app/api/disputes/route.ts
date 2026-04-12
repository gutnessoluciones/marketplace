import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DisputesService } from "@/services/disputes.service";
import { NotificationsService } from "@/services/notifications.service";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { sendDisputeOpenedEmail } from "@/lib/email";
import { z } from "zod";

const createDisputeSchema = z.object({
  order_id: z.string().uuid(),
  reason: z.enum([
    "item_not_received",
    "item_not_as_described",
    "damaged",
    "counterfeit",
    "other",
  ]),
  description: z.string().min(10).max(2000),
  evidence_urls: z.array(z.string().url()).max(5).optional(),
});

// POST /api/disputes
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "api");
  if (rl) return rl;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = createDisputeSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        400,
      );
    }

    const service = new DisputesService(supabase);
    const dispute = await service.create(user.id, parsed.data);

    // Notify admins (we'll just create a notification for the other party)
    const notifications = new NotificationsService(supabase);
    const { data: order } = await supabase
      .from("orders")
      .select("buyer_id, seller_id")
      .eq("id", parsed.data.order_id)
      .single();

    if (order) {
      const otherParty =
        order.buyer_id === user.id ? order.seller_id : order.buyer_id;
      await notifications.create({
        user_id: otherParty,
        type: "dispute_opened",
        title: "Disputa abierta",
        message: `Se ha abierto una disputa en uno de tus pedidos.`,
        data: { dispute_id: dispute.id, order_id: parsed.data.order_id },
      });

      // Email
      const { data: otherAuth } =
        await supabaseAdmin.auth.admin.getUserById(otherParty);
      if (otherAuth?.user?.email) {
        sendDisputeOpenedEmail(
          otherAuth.user.email,
          parsed.data.order_id,
        ).catch(() => {});
      }
    }

    return apiResponse(dispute, 201);
  } catch (error) {
    return apiError(error);
  }
}

// GET /api/disputes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;

    const service = new DisputesService(supabase);
    const result = await service.listByUser(user.id, page);
    return apiResponse(result);
  } catch (error) {
    return apiError(error);
  }
}
