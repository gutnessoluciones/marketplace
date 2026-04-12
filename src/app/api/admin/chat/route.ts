import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { NextRequest } from "next/server";

// GET /api/admin/chat — list all conversations
export async function GET(request: NextRequest) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 50);

    const { data, error, count } = await supabaseAdmin
      .from("conversations")
      .select(
        `*, 
        product:products(id, title, images, price),
        buyer:profiles!buyer_id(id, display_name, avatar_url),
        seller:profiles!seller_id(id, display_name, avatar_url)`,
        { count: "exact" },
      )
      .order("last_message_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error)
      return apiResponse({ error: "Error al obtener conversaciones" }, 500);

    const conversations = (data ?? []).map(
      (c: {
        id: string;
        product: unknown;
        buyer: unknown;
        seller: unknown;
      }) => ({
        ...c,
        product: Array.isArray(c.product) ? c.product[0] : c.product,
        buyer: Array.isArray(c.buyer) ? c.buyer[0] : c.buyer,
        seller: Array.isArray(c.seller) ? c.seller[0] : c.seller,
      }),
    );

    return apiResponse({ conversations, total: count, page, limit });
  } catch (error) {
    return apiError(error);
  }
}
