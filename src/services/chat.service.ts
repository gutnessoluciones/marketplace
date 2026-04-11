import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

export class ChatService {
  constructor(private supabase: SupabaseClient) {}

  async getOrCreateConversation(
    productId: string,
    buyerId: string,
    sellerId: string,
  ) {
    // Check existing
    const { data: existing } = await this.supabase
      .from("conversations")
      .select("id")
      .eq("product_id", productId)
      .eq("buyer_id", buyerId)
      .maybeSingle();

    if (existing) return existing.id;

    // Create new
    const { data, error } = await this.supabase
      .from("conversations")
      .insert({ product_id: productId, buyer_id: buyerId, seller_id: sellerId })
      .select("id")
      .single();

    if (error) throw new AppError(error.message, 500);
    return data.id;
  }

  async listConversations(userId: string) {
    const { data, error } = await this.supabase
      .from("conversations")
      .select(
        `*, 
        product:products(id, title, images, price),
        buyer:profiles!buyer_id(id, display_name, avatar_url),
        seller:profiles!seller_id(id, display_name, avatar_url)`,
      )
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async getConversation(conversationId: string, userId: string) {
    const { data, error } = await this.supabase
      .from("conversations")
      .select(
        `*, 
        product:products(id, title, images, price, status),
        buyer:profiles!buyer_id(id, display_name, avatar_url),
        seller:profiles!seller_id(id, display_name, avatar_url)`,
      )
      .eq("id", conversationId)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .single();

    if (error) throw new AppError("Conversación no encontrada", 404);
    return data;
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    const { data, error, count } = await this.supabase
      .from("messages")
      .select("*, sender:profiles!sender_id(id, display_name, avatar_url)", {
        count: "exact",
      })
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 2000) {
      throw new AppError("Mensaje inválido (1-2000 caracteres)", 400);
    }

    const { data, error } = await this.supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmed,
      })
      .select("*, sender:profiles!sender_id(id, display_name, avatar_url)")
      .single();

    if (error) throw new AppError(error.message, 500);

    // Update conversation timestamp
    await this.supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data;
  }

  async markAsRead(conversationId: string, userId: string) {
    const { error } = await this.supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .is("read_at", null);

    if (error) throw new AppError(error.message, 500);
  }

  async getUnreadCount(userId: string) {
    const { data, error } = await this.supabase.rpc(
      "get_unread_messages_count",
      { p_user_id: userId },
    );
    if (error) throw new AppError(error.message, 500);
    return data ?? 0;
  }
}
