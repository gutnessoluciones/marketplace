import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

interface CreateBuyerReviewInput {
  order_id: string;
  rating: number;
  comment?: string;
}

export class BuyerReviewsService {
  constructor(private supabase: SupabaseClient) {}

  async create(sellerId: string, input: CreateBuyerReviewInput) {
    // Verify order belongs to seller
    const { data: order, error: orderError } = await this.supabase
      .from("orders")
      .select("id, buyer_id, seller_id, status")
      .eq("id", input.order_id)
      .eq("seller_id", sellerId)
      .single();

    if (orderError || !order) throw new AppError("Pedido no encontrado", 404);

    if (order.status !== "delivered" && order.status !== "paid") {
      throw new AppError(
        "Solo puedes valorar pedidos pagados o entregados",
        400,
      );
    }

    // Check existing
    const { data: existing } = await this.supabase
      .from("buyer_reviews")
      .select("id")
      .eq("order_id", input.order_id)
      .maybeSingle();

    if (existing) throw new AppError("Ya has valorado a este comprador", 409);

    const { data, error } = await this.supabase
      .from("buyer_reviews")
      .insert({
        order_id: input.order_id,
        seller_id: sellerId,
        buyer_id: order.buyer_id,
        rating: input.rating,
        comment: input.comment?.trim() || null,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async listByBuyer(buyerId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.supabase
      .from("buyer_reviews")
      .select("*, seller:profiles!seller_id(id, display_name, avatar_url)", {
        count: "exact",
      })
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }

  async getBuyerRating(buyerId: string) {
    const { data, error } = await this.supabase
      .from("buyer_reviews")
      .select("rating")
      .eq("buyer_id", buyerId);

    if (error) throw new AppError(error.message, 500);
    if (!data || data.length === 0) return { avg: 0, count: 0 };

    const sum = data.reduce((a, r) => a + r.rating, 0);
    return {
      avg: Math.round((sum / data.length) * 10) / 10,
      count: data.length,
    };
  }
}
