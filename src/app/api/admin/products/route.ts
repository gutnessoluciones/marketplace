import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { NextRequest } from "next/server";

// GET /api/admin/products — List all products (admin only, paginated)
export async function GET(request: NextRequest) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);

    const { data, error, count } = await supabaseAdmin
      .from("products")
      .select("*, seller:profiles!seller_id(display_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) return apiResponse({ error: "Error al obtener productos" }, 500);

    return apiResponse({ data, total: count, page, limit });
  } catch (error) {
    return apiError(error);
  }
}
