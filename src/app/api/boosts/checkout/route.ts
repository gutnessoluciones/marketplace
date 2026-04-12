import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const BOOST_PRICES: Record<
  string,
  { amount: number; label: string; days: number }
> = {
  featured: { amount: 999, label: "Destacado (7 días)", days: 7 },
  top: { amount: 499, label: "Top (3 días)", days: 3 },
  highlight: { amount: 199, label: "Resaltado (1 día)", days: 1 },
};

const checkoutSchema = z.object({
  product_id: z.string().uuid(),
  boost_type: z.enum(["featured", "top", "highlight"]),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return apiResponse({ error: "Datos inválidos" }, 400);

    const { product_id, boost_type } = parsed.data;

    // Verify product ownership
    const { data: product } = await supabase
      .from("products")
      .select("id, title, seller_id, status")
      .eq("id", product_id)
      .eq("seller_id", user.id)
      .eq("status", "active")
      .single();

    if (!product) return apiResponse({ error: "Producto no encontrado" }, 404);

    // Check no active boost
    const { data: existing } = await supabase
      .from("product_boosts")
      .select("id")
      .eq("product_id", product_id)
      .eq("active", true)
      .gt("ends_at", new Date().toISOString())
      .maybeSingle();

    if (existing)
      return apiResponse({ error: "Ya tiene un boost activo" }, 409);

    const price = BOOST_PRICES[boost_type];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Boost: ${price.label}`,
              description: `Boost para "${product.title}"`,
            },
            unit_amount: price.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "boost",
        product_id,
        seller_id: user.id,
        boost_type,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/products/${product_id}?boost=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/products/${product_id}?boost=cancelled`,
    });

    return apiResponse({ url: session.url });
  } catch (error) {
    return apiError(error);
  }
}
