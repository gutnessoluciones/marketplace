import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/chat/[id] — get conversation details + all messages
export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { id } = await context.params;

    // Get conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("conversations")
      .select(
        `*, 
        product:products(id, title, images, price, status),
        buyer:profiles!buyer_id(id, display_name, avatar_url, email:id),
        seller:profiles!seller_id(id, display_name, avatar_url, email:id)`,
      )
      .eq("id", id)
      .single();

    if (convError)
      return apiResponse({ error: "Conversación no encontrada" }, 404);

    // Get all messages
    const { data: messages, error: msgError } = await supabaseAdmin
      .from("messages")
      .select("*, sender:profiles!sender_id(id, display_name, avatar_url)")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgError) return apiResponse({ error: msgError.message }, 500);

    const conv = {
      ...conversation,
      product: Array.isArray(conversation.product)
        ? conversation.product[0]
        : conversation.product,
      buyer: Array.isArray(conversation.buyer)
        ? conversation.buyer[0]
        : conversation.buyer,
      seller: Array.isArray(conversation.seller)
        ? conversation.seller[0]
        : conversation.seller,
    };

    return apiResponse({ conversation: conv, messages: messages ?? [] });
  } catch (error) {
    return apiError(error);
  }
}
