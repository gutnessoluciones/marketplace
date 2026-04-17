import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

interface CreateReviewInput {
  order_id: string;
  rating: number;
  comment?: string;
}

export class ReviewsService {
  constructor(private supabase: SupabaseClient) {}

  async listByProduct(productId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.supabase
      .from("reviews")
      .select("*, buyer:profiles!buyer_id(id, display_name, avatar_url)", {
        count: "exact",
      })
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }

  async create(buyerId: string, input: CreateReviewInput) {
    // Verify order belongs to buyer and is paid
    const { data: order, error: orderError } = await this.supabase
      .from("orders")
      .select("id, product_id, seller_id, status")
      .eq("id", input.order_id)
      .eq("buyer_id", buyerId)
      .single();

    if (orderError || !order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status !== "delivered") {
      throw new AppError(
        "Solo puedes dejar una reseña después de recibir el producto",
        400,
      );
    }

    // Check if review already exists
    const { data: existing } = await this.supabase
      .from("reviews")
      .select("id")
      .eq("order_id", input.order_id)
      .single();

    if (existing) {
      throw new AppError("Review already exists for this order", 409);
    }

    const { data, error } = await this.supabase
      .from("reviews")
      .insert({
        order_id: input.order_id,
        product_id: order.product_id,
        buyer_id: buyerId,
        seller_id: order.seller_id,
        rating: input.rating,
        comment: input.comment || null,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }
}
