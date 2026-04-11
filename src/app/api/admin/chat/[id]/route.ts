import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

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

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
});

// POST /api/admin/chat/[id] — Admin sends a message in a conversation
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized || !auth.userId)
      return apiResponse({ error: "Forbidden" }, 403);

    const { id } = await context.params;
    const body = await request.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: "Mensaje no válido" }, 400);

    // Verify conversation exists
    const { data: conv, error: convErr } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("id", id)
      .single();

    if (convErr || !conv)
      return apiResponse({ error: "Conversación no encontrada" }, 404);

    // Insert message as admin user
    const { data: message, error: msgErr } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: id,
        sender_id: auth.userId,
        content: parsed.data.content,
      })
      .select()
      .single();

    if (msgErr) return apiResponse({ error: msgErr.message }, 500);

    // Update conversation last_message_at
    await supabaseAdmin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", id);

    return apiResponse({ data: message }, 201);
  } catch (error) {
    return apiError(error);
  }
}
