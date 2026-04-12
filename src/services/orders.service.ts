import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

const PLATFORM_FEE_PERCENT = 10;

interface CreateOrderInput {
  product_id: string;
  quantity: number;
  shipping_address?: Record<string, unknown>;
  coupon_id?: string;
  discount_amount?: number;
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
    const discount = input.discount_amount ?? 0;
    const finalAmount = Math.max(totalAmount - discount, 0);
    const platformFee = Math.round((finalAmount * PLATFORM_FEE_PERCENT) / 100);

    // C1 FIX: Atomic stock decrement + order creation via PostgreSQL function
    const { data: orderId, error } = await this.supabase.rpc(
      "create_order_atomic",
      {
        p_buyer_id: buyerId,
        p_seller_id: product.seller_id,
        p_product_id: product.id,
        p_quantity: input.quantity,
        p_total_amount: finalAmount,
        p_platform_fee: platformFee,
        p_shipping_address: input.shipping_address || null,
        p_coupon_id: input.coupon_id || null,
        p_discount_amount: discount || null,
      },
    );

    if (error) {
      if (error.message?.includes("INSUFFICIENT_STOCK")) {
        throw new AppError("Insufficient stock", 409);
      }
      throw new AppError("Error al crear el pedido", 500);
    }

    // Fetch the created order
    const { data: order } = await this.supabase
      .from("orders")
      .select()
      .eq("id", orderId)
      .single();

    if (!order) throw new AppError("Error al crear el pedido", 500);
    return order;
  }

  async getById(orderId: string, userId: string) {
    const { data, error } = await this.supabase
      .from("orders")
      .select(
        "*, product:products(id, title, images, price), seller:profiles!seller_id(id, display_name, avatar_url)",
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

  async listByUser(
    userId: string,
    role: "buyer" | "seller",
    page = 1,
    limit = 20,
  ) {
    const column = role === "buyer" ? "buyer_id" : "seller_id";

    const { data, error, count } = await this.supabase
      .from("orders")
      .select("*, product:products(id, title, images, price)", {
        count: "exact",
      })
      .eq(column, userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError("Error al obtener pedidos", 500);
    return { data: data ?? [], total: count, page, limit };
  }

  async updateStatus(
    orderId: string,
    sellerId: string,
    input: {
      status: string;
      tracking_number?: string;
      tracking_url?: string;
      tracking_carrier?: string;
    },
  ) {
    // Verify order belongs to seller
    const { data: order, error: fetchError } = await this.supabase
      .from("orders")
      .select("id, status, seller_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) throw new AppError("Order not found", 404);
    if (order.seller_id !== sellerId)
      throw new AppError("Order not found", 404);

    // Validate status transition
    const VALID_TRANSITIONS: Record<string, string[]> = {
      paid: ["shipped"],
      shipped: ["delivered"],
    };

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(input.status)) {
      throw new AppError(
        `Cannot change status from ${order.status} to ${input.status}`,
        400,
      );
    }

    const updateData: Record<string, unknown> = { status: input.status };
    if (input.tracking_number)
      updateData.tracking_number = input.tracking_number;
    if (input.tracking_url) updateData.tracking_url = input.tracking_url;
    if (input.tracking_carrier)
      updateData.tracking_carrier = input.tracking_carrier;
    if (input.status === "shipped")
      updateData.shipped_at = new Date().toISOString();
    if (input.status === "delivered")
      updateData.delivered_at = new Date().toISOString();

    const { data: updated, error } = await this.supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw new AppError("Error al actualizar el pedido", 500);
    return updated;
  }
}
