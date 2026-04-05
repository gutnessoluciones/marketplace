import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/admin/users — List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 50);
    const search = searchParams.get("q") || "";

    let query = supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.ilike("display_name", `%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) return apiResponse({ error: error.message }, 500);

    return apiResponse({ data, total: count, page, limit });
  } catch (error) {
    return apiError(error);
  }
}
