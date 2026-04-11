import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BuyerReviewsService } from "@/services/buyer-reviews.service";
import { NotificationsService } from "@/services/notifications.service";
import { createReviewSchema } from "@/validations/schemas";
import { apiResponse, apiError } from "@/lib/utils";

// POST /api/buyer-reviews — seller rates buyer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        400,
      );
    }

    const service = new BuyerReviewsService(supabase);
    const review = await service.create(user.id, parsed.data);

    // Notify buyer
    const notifications = new NotificationsService(supabase);
    await notifications.create({
      user_id: review.buyer_id,
      type: "buyer_review",
      title: "Nueva valoración recibida",
      message: `El vendedor te ha valorado con ${review.rating} estrellas.`,
      data: { review_id: review.id, order_id: review.order_id },
    });

    return apiResponse(review, 201);
  } catch (error) {
    return apiError(error);
  }
}

// GET /api/buyer-reviews?buyer_id=xxx
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get("buyer_id") || user.id;
    const page = Number(searchParams.get("page")) || 1;

    const service = new BuyerReviewsService(supabase);
    const result = await service.listByBuyer(buyerId, page);
    return apiResponse(result);
  } catch (error) {
    return apiError(error);
  }
}
