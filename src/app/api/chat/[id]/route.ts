import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ChatService } from "@/services/chat.service";
import { apiResponse, apiError } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/chat/[id] — get messages for a conversation
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const service = new ChatService(supabase);
    const [conversation, messages] = await Promise.all([
      service.getConversation(id, user.id),
      service.getMessages(id),
    ]);

    // Mark messages as read
    await service.markAsRead(id, user.id);

    return apiResponse({ conversation, messages });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/chat/[id] — send a message
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const { content } = body;
    if (!content) return apiResponse({ error: "content required" }, 400);

    const service = new ChatService(supabase);

    // Verify user is participant
    await service.getConversation(id, user.id);

    const message = await service.sendMessage(id, user.id, content);
    return apiResponse(message);
  } catch (error) {
    return apiError(error);
  }
}
