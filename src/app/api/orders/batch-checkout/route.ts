import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, getPlatformFeePercent } from "@/lib/stripe";
import { apiResponse, apiError, AppError } from "@/lib/utils";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

const batchSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(10).default(1),
      }),
    )
    .min(1)
    .max(20),
  shipping_address: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = batchSchema.safeParse(body);
    if (!parsed.success) return apiResponse({ error: "Datos inválidos" }, 400);

    const productIds = parsed.data.items.map((i) => i.product_id);

    // Fetch all products
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select(
        "id, title, price, images, seller_id, stock, status, seller:profiles!seller_id(stripe_account_id, display_name)",
      )
      .in("id", productIds)
      .eq("status", "active");

    if (pErr || !products?.length) {
      throw new AppError("Productos no encontrados", 404);
    }

    // Verify all products belong to the same seller
    const sellerIds = new Set(products.map((p) => p.seller_id));
    if (sellerIds.size > 1) {
      throw new AppError(
        "Solo puedes comprar artículos de un mismo vendedor a la vez",
        400,
      );
    }

    const sellerId = products[0].seller_id;
    if (sellerId === user.id) {
      throw new AppError("No puedes comprar tus propios productos", 400);
    }

    const sellerAccount = (
      products[0].seller as unknown as { stripe_account_id: string | null }
    )?.stripe_account_id;
    if (!sellerAccount) {
      throw new AppError("El vendedor no tiene pagos configurados", 400);
    }

    // Create orders and build line items
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; images?: string[] };
        unit_amount: number;
      };
      quantity: number;
    }> = [];
    const orderIds: string[] = [];
    let totalAmount = 0;

    for (const item of parsed.data.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;

      const qty = item.quantity;
      if (product.stock < qty) {
        throw new AppError(`"${product.title}" no tiene stock suficiente`, 400);
      }

      const orderTotal = product.price * qty;
      totalAmount += orderTotal;

      const feePercent = await getPlatformFeePercent();
      const itemPlatformFee = Math.round((orderTotal * feePercent) / 100);

      // Atomic order creation with stock decrement
      const { data: orderId, error: oErr } = await supabaseAdmin.rpc(
        "create_order_atomic",
        {
          p_buyer_id: user.id,
          p_seller_id: sellerId,
          p_product_id: product.id,
          p_quantity: qty,
          p_total_amount: orderTotal,
          p_platform_fee: itemPlatformFee,
          p_shipping_address: parsed.data.shipping_address ?? null,
          p_coupon_id: null,
          p_discount_amount: null,
        },
      );

      if (oErr) {
        if (oErr.message?.includes("INSUFFICIENT_STOCK")) {
          throw new AppError(
            `"${product.title}" no tiene stock suficiente`,
            409,
          );
        }
        throw new AppError("Error al crear el pedido", 500);
      }

      orderIds.push(orderId);

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product.title,
            images: product.images?.slice(0, 1) || [],
          },
          unit_amount: product.price,
        },
        quantity: qty,
      });
    }

    const feePercentTotal = await getPlatformFeePercent();
    const platformFee = Math.round((totalAmount * feePercentTotal) / 100);

    // Create single Stripe checkout for all items
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerAccount,
        },
      },
      metadata: {
        type: "batch",
        order_ids: orderIds.join(","),
        buyer_id: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.flamencalia.com"}/dashboard/orders?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.flamencalia.com"}/dashboard/cart?cancelled=true`,
    });

    // Store session ID on all orders
    for (const oid of orderIds) {
      await supabaseAdmin
        .from("orders")
        .update({ stripe_checkout_session_id: session.id })
        .eq("id", oid);
    }

    return apiResponse({ url: session.url });
  } catch (error) {
    return apiError(error);
  }
}
