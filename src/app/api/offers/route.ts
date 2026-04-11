import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OffersService } from "@/services/offers.service";
import { NotificationsService } from "@/services/notifications.service";
import { createOfferSchema } from "@/validations/schemas";
import { apiResponse, apiError, formatPrice } from "@/lib/utils";

// POST /api/offers — Create a new offer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = createOfferSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    const service = new OffersService(supabase);
    const offer = await service.create(user.id, parsed.data);

    // Notify seller
    const notifications = new NotificationsService(supabase);
    const { data: buyerProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    await notifications.create({
      user_id: offer.seller_id,
      type: "offer_received",
      title: "Nueva oferta recibida",
      message: `${buyerProfile?.display_name ?? "Un comprador"} te ha ofrecido ${formatPrice(offer.amount)} por tu producto`,
      data: {
        offer_id: offer.id,
        product_id: offer.product_id,
        amount: offer.amount,
      },
    });

    return apiResponse(offer, 201);
  } catch (error) {
    return apiError(error);
  }
}

// GET /api/offers — List offers (buyer's offers)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const url = new URL(request.url);
    const role = url.searchParams.get("role") ?? "buyer";
    const status = url.searchParams.get("status") ?? undefined;
    const page = parseInt(url.searchParams.get("page") ?? "1");

    const service = new OffersService(supabase);

    if (role === "seller") {
      const result = await service.listBySeller(user.id, status, page);
      return apiResponse(result);
    }

    const result = await service.listByBuyer(user.id, page);
    return apiResponse(result);
  } catch (error) {
    return apiError(error);
  }
}
