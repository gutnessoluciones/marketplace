import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OffersService } from "@/services/offers.service";
import { NotificationsService } from "@/services/notifications.service";
import { respondOfferSchema } from "@/validations/schemas";
import { apiResponse, apiError, formatPrice } from "@/lib/utils";

interface Ctx {
  params: Promise<{ id: string }>;
}

// POST /api/offers/[id]/accept
export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const url = new URL(request.url);
  const action = url.pathname.split("/").pop(); // last segment

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json().catch(() => ({}));
    const parsed = respondOfferSchema.safeParse(body);

    const service = new OffersService(supabase);
    const notifications = new NotificationsService(supabase);

    if (action === "accept") {
      const offer = await service.accept(
        id,
        user.id,
        parsed.success ? parsed.data.response : undefined,
      );

      // Notify buyer
      await notifications.create({
        user_id: offer.buyer_id,
        type: "offer_accepted",
        title: "¡Oferta aceptada!",
        message: `Tu oferta de ${formatPrice(offer.amount)} ha sido aceptada. Procede al pago.`,
        data: {
          offer_id: offer.id,
          product_id: offer.product_id,
          amount: offer.amount,
        },
      });

      return apiResponse(offer);
    }

    if (action === "reject") {
      const offer = await service.reject(
        id,
        user.id,
        parsed.success ? parsed.data.response : undefined,
      );

      await notifications.create({
        user_id: offer.buyer_id,
        type: "offer_rejected",
        title: "Oferta rechazada",
        message: `Tu oferta de ${formatPrice(offer.amount)} ha sido rechazada.`,
        data: { offer_id: offer.id, product_id: offer.product_id },
      });

      return apiResponse(offer);
    }

    if (action === "cancel") {
      const offer = await service.cancel(id, user.id);
      return apiResponse(offer);
    }

    return apiResponse({ error: "Invalid action" }, 400);
  } catch (error) {
    return apiError(error);
  }
}
