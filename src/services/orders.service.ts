import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

const PLATFORM_FEE_PERCENT = 10;

interface CreateOrderInput {
  product_id: string;
  quantity: number;
  shipping_address?: Record<string, unknown>;
}

export class OrdersService {
  constructor(private supabase: SupabaseClient) {}

  async create(buyerId: string, input: CreateOrderInput) {
    // Fetch product to calculate total
    const { data: product, error: productError } = await this.supabase
      .from("products")
      .select("id, seller_id, price, stock, status")
      .eq("id", input.product_id)
      .eq("status", "active")
      .single();

    if (productError || !product) {
      throw new AppError("Product not found or unavailable", 404);
    }

    if (product.seller_id === buyerId) {
      throw new AppError("Cannot buy your own product", 400);
    }

    if (product.stock < input.quantity) {
      throw new AppError("Insufficient stock", 400);
    }

    const totalAmount = product.price * input.quantity;
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT / 100);

    const { data: order, error } = await this.supabase
      .from("orders")
      .insert({
        buyer_id: buyerId,
        seller_id: product.seller_id,
        product_id: product.id,
        quantity: input.quantity,
        total_amount: totalAmount,
        platform_fee: platformFee,
        shipping_address: input.shipping_address || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return order;
  }

  async getById(orderId: string, userId: string) {
    const { data, error } = await this.supabase
      .from("orders")
      .select(
        "*, product:products(id, title, images, price), seller:profiles!seller_id(id, display_name)"
      )
      .eq("id", orderId)
      .single();

    if (error || !data) throw new AppError("Order not found", 404);

    // Verify ownership
    if (data.buyer_id !== userId && data.seller_id !== userId) {
      throw new AppError("Order not found", 404);
    }

    return data;
  }

  async listByUser(userId: string, role: "buyer" | "seller", page = 1, limit = 20) {
    const column = role === "buyer" ? "buyer_id" : "seller_id";

    const { data, error, count } = await this.supabase
      .from("orders")
      .select(
        "*, product:products(id, title, images, price)",
        { count: "exact" }
      )
      .eq(column, userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }
}
