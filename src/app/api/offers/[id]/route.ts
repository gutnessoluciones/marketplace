import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentsService } from "@/services/payments.service";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

interface Ctx {
  params: Promise<{ id: string }>;
}

// GET /api/offers/[id] — Get offer details or buyer's active offer for a product
export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { OffersService } = await import("@/services/offers.service");
    const service = new OffersService(supabase);
    const offer = await service.getActiveOffer(id, user.id);
    return apiResponse({ offer });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/offers/[id] — Pay for an accepted offer (creates order at offer price)
export async function POST(request: NextRequest, { params }: Ctx) {
  const rl = await rateLimit(request, "api");
  if (rl) return rl;

  const { id: offerId } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    // Fetch the accepted offer
    const { data: offer, error: oErr } = await supabase
      .from("offers")
      .select("*, product:products(id, seller_id, price, stock, status)")
      .eq("id", offerId)
      .eq("buyer_id", user.id)
      .eq("status", "accepted")
      .single();

    if (oErr || !offer)
      return apiResponse({ error: "Oferta no encontrada o no aceptada" }, 404);

    const product = offer.product as {
      id: string;
      seller_id: string;
      price: number;
      stock: number;
      status: string;
    } | null;
    if (!product || product.status !== "active" || product.stock < 1) {
      return apiResponse({ error: "Producto ya no disponible" }, 400);
    }

    // Create order at the offer price
    const totalAmount = offer.amount;
    const platformFee = Math.round((totalAmount * 10) / 100);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        seller_id: offer.seller_id,
        product_id: offer.product_id,
        quantity: 1,
        total_amount: totalAmount,
        platform_fee: platformFee,
        status: "pending",
      })
      .select()
      .single();

    if (orderErr)
      return apiResponse({ error: "Error al crear el pedido" }, 500);

    // C2 FIX: Use checkout_pending instead of paid (confirmed only via webhook)
    const { data: transitioned } = await supabase.rpc("offer_start_checkout", {
      p_offer_id: offerId,
      p_buyer_id: user.id,
      p_order_id: order.id,
    });

    if (!transitioned) {
      return apiResponse(
        { error: "La oferta ya no está disponible para pago" },
        409,
      );
    }

    // H4 FIX: Direct service call instead of internal HTTP fetch
    const paymentsService = new PaymentsService(supabase);
    const { url } = await paymentsService.createCheckoutSession(
      order.id,
      user.id,
    );

    return apiResponse({ url, order_id: order.id });
  } catch (error) {
    return apiError(error);
  }
}
