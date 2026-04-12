import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { apiResponse, apiError, AppError } from "@/lib/utils";
import { z } from "zod";

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

const PLATFORM_FEE_PERCENT = 10;

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

      // Create order
      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: product.id,
          quantity: qty,
          total_amount: orderTotal,
          status: "pending",
          shipping_address: parsed.data.shipping_address ?? null,
        })
        .select("id")
        .single();

      if (oErr || !order) {
        throw new AppError("Error al crear el pedido", 500);
      }

      orderIds.push(order.id);

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

    const platformFee = Math.round((totalAmount * PLATFORM_FEE_PERCENT) / 100);

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/cart?cancelled=true`,
    });

    // Store session ID on all orders
    for (const oid of orderIds) {
      await supabase
        .from("orders")
        .update({ stripe_checkout_session_id: session.id })
        .eq("id", oid);
    }

    return apiResponse({ url: session.url });
  } catch (error) {
    return apiError(error);
  }
}
