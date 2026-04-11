import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OffersService } from "@/services/offers.service";
import { NotificationsService } from "@/services/notifications.service";
import { respondOfferSchema } from "@/validations/schemas";
import { apiResponse, apiError, formatPrice } from "@/lib/utils";
import { sendOfferAcceptedEmail, sendOfferCounteredEmail } from "@/lib/email";

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

      // Email (fire-and-forget)
      const { data: prodAccept } = await supabase
        .from("products")
        .select("title")
        .eq("id", offer.product_id)
        .single();
      const { data: buyerAcceptAuth } = await supabase.auth.admin.getUserById(
        offer.buyer_id,
      );
      if (buyerAcceptAuth?.user?.email && prodAccept)
        sendOfferAcceptedEmail(
          buyerAcceptAuth.user.email,
          prodAccept.title,
          offer.amount,
        ).catch(() => {});

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

    if (action === "counter") {
      const counterAmount = body.counter_amount;
      if (!counterAmount || typeof counterAmount !== "number") {
        return apiResponse({ error: "counter_amount is required" }, 400);
      }
      const offer = await service.counter(
        id,
        user.id,
        counterAmount,
        parsed.success ? parsed.data.response : undefined,
      );

      await notifications.create({
        user_id: offer.buyer_id,
        type: "offer_countered",
        title: "Contraoferta recibida",
        message: `El vendedor te propone ${formatPrice(offer.counter_amount)} como contraoferta.`,
        data: {
          offer_id: offer.id,
          product_id: offer.product_id,
          counter_amount: offer.counter_amount,
        },
      });

      // Email
      const { data: prodCounter } = await supabase
        .from("products")
        .select("title")
        .eq("id", offer.product_id)
        .single();
      const { data: buyerCounterAuth } = await supabase.auth.admin.getUserById(
        offer.buyer_id,
      );
      if (buyerCounterAuth?.user?.email && prodCounter)
        sendOfferCounteredEmail(
          buyerCounterAuth.user.email,
          prodCounter.title,
          offer.counter_amount,
        ).catch(() => {});

      return apiResponse(offer);
    }

    if (action === "accept-counter") {
      const offer = await service.acceptCounter(id, user.id);

      await notifications.create({
        user_id: offer.seller_id,
        type: "offer_accepted",
        title: "Contraoferta aceptada",
        message: `El comprador ha aceptado tu contraoferta de ${formatPrice(offer.amount)}.`,
        data: {
          offer_id: offer.id,
          product_id: offer.product_id,
          amount: offer.amount,
        },
      });

      return apiResponse(offer);
    }

    if (action === "reject-counter") {
      const offer = await service.rejectCounter(id, user.id);

      await notifications.create({
        user_id: offer.seller_id,
        type: "offer_rejected",
        title: "Contraoferta rechazada",
        message: `El comprador ha rechazado tu contraoferta.`,
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
