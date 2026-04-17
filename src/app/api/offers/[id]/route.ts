import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentsService } from "@/services/payments.service";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { getPlatformFeePercent } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

    // Create order at the offer price (atomic with stock decrement)
    const totalAmount = offer.amount;
    const feePercent = await getPlatformFeePercent();
    const platformFee = Math.round((totalAmount * feePercent) / 100);

    const { data: orderId, error: orderErr } = await supabaseAdmin.rpc(
      "create_order_atomic",
      {
        p_buyer_id: user.id,
        p_seller_id: offer.seller_id,
        p_product_id: offer.product_id,
        p_quantity: 1,
        p_total_amount: totalAmount,
        p_platform_fee: platformFee,
        p_shipping_address: null,
        p_coupon_id: null,
        p_discount_amount: null,
      },
    );

    if (orderErr) {
      if (orderErr.message?.includes("INSUFFICIENT_STOCK")) {
        return apiResponse({ error: "Producto sin stock" }, 409);
      }
      return apiResponse({ error: "Error al crear el pedido" }, 500);
    }

    // C2 FIX: Use checkout_pending instead of paid (confirmed only via webhook)
    const { data: transitioned } = await supabase.rpc("offer_start_checkout", {
      p_offer_id: offerId,
      p_buyer_id: user.id,
      p_order_id: orderId,
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
      orderId,
      user.id,
    );

    return apiResponse({ url, order_id: orderId });
  } catch (error) {
    return apiError(error);
  }
}
