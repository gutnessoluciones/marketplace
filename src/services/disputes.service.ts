import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

interface CreateDisputeInput {
  order_id: string;
  reason: string;
  description: string;
  evidence_urls?: string[];
}

export class DisputesService {
  constructor(private supabase: SupabaseClient) {}

  async create(userId: string, input: CreateDisputeInput) {
    // Verify order belongs to user
    const { data: order, error: oErr } = await this.supabase
      .from("orders")
      .select("id, buyer_id, seller_id, status")
      .eq("id", input.order_id)
      .single();

    if (oErr || !order) throw new AppError("Pedido no encontrado", 404);
    if (order.buyer_id !== userId && order.seller_id !== userId) {
      throw new AppError("No autorizado", 403);
    }

    if (!["paid", "shipped", "delivered"].includes(order.status)) {
      throw new AppError(
        "Solo puedes abrir disputas en pedidos pagados/enviados/entregados",
        400,
      );
    }

    // Check existing open dispute
    const { data: existing } = await this.supabase
      .from("disputes")
      .select("id")
      .eq("order_id", input.order_id)
      .in("status", ["open", "in_review"])
      .maybeSingle();

    if (existing)
      throw new AppError("Ya existe una disputa abierta para este pedido", 409);

    const reporterRole = order.buyer_id === userId ? "buyer" : "seller";

    const { data, error } = await this.supabase
      .from("disputes")
      .insert({
        order_id: input.order_id,
        reporter_id: userId,
        reporter_role: reporterRole,
        reason: input.reason,
        description: input.description.trim(),
        evidence_urls: input.evidence_urls ?? [],
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async listByUser(userId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.supabase
      .from("disputes")
      .select(
        "*, order:orders(id, total_amount, product:products(id, title, images))",
        { count: "exact" },
      )
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }

  async getById(disputeId: string, userId: string) {
    const { data, error } = await this.supabase
      .from("disputes")
      .select(
        "*, order:orders(id, total_amount, buyer_id, seller_id, product:products(id, title, images))",
      )
      .eq("id", disputeId)
      .single();

    if (error || !data) throw new AppError("Disputa no encontrada", 404);

    const order = data.order as { buyer_id: string; seller_id: string } | null;
    if (
      data.reporter_id !== userId &&
      order?.buyer_id !== userId &&
      order?.seller_id !== userId
    ) {
      throw new AppError("No autorizado", 403);
    }

    return data;
  }

  // Admin methods
  async listAll(status?: string, page = 1, limit = 20) {
    let query = this.supabase
      .from("disputes")
      .select(
        "*, order:orders(id, total_amount, product:products(id, title)), reporter:profiles!reporter_id(id, display_name)",
        { count: "exact" },
      );

    if (status) query = query.eq("status", status);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }

  async resolve(disputeId: string, resolution: string, adminNotes?: string) {
    const { data, error } = await this.supabase
      .from("disputes")
      .update({
        status: "resolved",
        resolution,
        admin_notes: adminNotes?.trim() || null,
      })
      .eq("id", disputeId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }
}
