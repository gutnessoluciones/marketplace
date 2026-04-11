import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ChatService } from "@/services/chat.service";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/chat — list user's conversations
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const service = new ChatService(supabase);
    const [conversations, unreadCount] = await Promise.all([
      service.listConversations(user.id),
      service.getUnreadCount(user.id),
    ]);
    return apiResponse({ conversations, unreadCount });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/chat — start or get a conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const { product_id, seller_id } = body;
    if (!product_id || !seller_id) {
      return apiResponse({ error: "product_id and seller_id required" }, 400);
    }

    if (user.id === seller_id) {
      return apiResponse({ error: "No puedes chatear contigo mismo" }, 400);
    }

    const service = new ChatService(supabase);
    const conversationId = await service.getOrCreateConversation(
      product_id,
      user.id,
      seller_id,
    );
    return apiResponse({ conversation_id: conversationId });
  } catch (error) {
    return apiError(error);
  }
}
